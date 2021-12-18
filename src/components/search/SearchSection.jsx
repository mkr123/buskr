import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaRegCalendar, FaLongArrowAltLeft } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import AutoComplete from './Autocomplete';
import styles from '../../styles/Search.module.css';
import { LocationContext, SearchContext } from '../../contexts';

const SearchSection = ({ setLocation }) => {
  const SearchbarContext = useContext(SearchContext);
  const { results, setResults } = SearchbarContext;
  const geoLocation = useContext(LocationContext);
  const dummyTags = ['Starting soon', 'Tomorrow', 'Near you', 'Dance', 'Magic', 'Clowns'];
  const [searchTerm, setSearchTerm] = useState('');
  const [address, setAddress] = useState('');
  const [searchLocation, setSearchLocation] = useState(geoLocation);
  const [searchDate, setSearchDate] = useState(new Date());
  const [initialList, setInitialList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const onSearchSubmit = React.useCallback(async (collapseBar) => {
    // SearchbarContext.setBarView(!SearchbarContext.isBarView);
    let location = searchLocation;
    if (address !== '') {
      const { data } = await axios.get('/api/search', { params: { address } });
      if (data) {
        location = data;
      }
      setLocation(data);
    }
    console.log(searchDate);
    const tomorrow = new Date(searchDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/events`, {
      params: {
        features: 'coords,location,photos,tags',
        lat: location.lat,
        lng: location.lng,
        from: searchDate,
        to: tomorrow,
      },
    }).then((result) => {
      setInitialList(result.data.features);
      const tooFar = result.data.features.findIndex(event => {
        const [lng, lat] = event.geometry.coordinates;
        return Math.exp(location.lng - lng, 2) + Math.exp(location.lat - lat, 2) > 10;
      });
      if (tooFar !== -1) {
        result.data.features.length = tooFar;
      }
      const oneDate = result.data.features.slice();
      const byTime = oneDate.slice().sort(
        (a, b) => new Date(a.properties.starts) - new Date(b.properties.starts),
      );
      const byLocation = tooFar === -1 ? oneDate.slice() : oneDate.slice(0, tooFar);
      let bySearchTerm = address === '' ? oneDate : byLocation;
      if (searchTerm) {
        bySearchTerm = bySearchTerm.slice().filter(
          (event) => {
            const searchedTerm = searchTerm.toLowerCase();
            const filteredEvents = event.properties.name.toLowerCase()
              .includes(searchedTerm)
              || event.properties.buskerName.toLowerCase().includes(searchedTerm)
              || event.properties.tags.indexOf(searchedTerm) !== -1;
            return filteredEvents;
          },
        );
      }
      const autoSuggestions = [];
      bySearchTerm.forEach(
        (event) => {
          if (autoSuggestions.indexOf(event.properties.name) === -1) {
            autoSuggestions.push(event.properties.name);
          }
          if (autoSuggestions.indexOf(event.properties.buskerName) === -1) {
            autoSuggestions.push(event.properties.buskerName);
          }
          for (let i = 0; i < event.properties.tags.length; i++) {
            if (autoSuggestions.indexOf(event.properties.tags[i]) === -1) {
              autoSuggestions.push(event.properties.tags[i]);
            }
          }
        },
      );
      setSuggestions(autoSuggestions);
      setResults({
        byDistance: oneDate,
        byTime,
        filtered: bySearchTerm,
        filterWords: {
          lat: location.lat,
          lng: location.lng,
          starts: searchDate,
          keywords: searchTerm,
        },
      });
      if (collapseBar) {
        SearchbarContext.setBarView(true);
      }
    });
  }, [searchDate, searchLocation, address, searchTerm, setResults, SearchbarContext]);
  useEffect(() => {
    setSearchDate(SearchbarContext.calendarDate);
  }, [SearchbarContext.calendarDate]);
  useEffect(() => {
    onSearchSubmit();
  }, [searchDate]);

  const onSearchTermChange = (e) => {
    if (e.target.value) {
      setSearchTerm(e.target.value);
    } else {
      setSearchTerm(e.target.innerText);
    }
  };
  const onSearchLocationChange = (e) => {
    setAddress(e.target.value);
  };

  const onDateChange = (date) => {
    if (date !== null) {
      setSearchDate(date);
    }
  };

  const onTagClick = (e) => {
    // filter based on initial list when rendered since it will not be visible after initial search
    SearchbarContext.setBarView(true);
    const tagName = e.target.innerText;
    if (tagName === 'Starting soon') {
      setSearchDate(new Date());
      setResults(
        { ...results, filtered: results.byTime },
      );
    } else if (tagName === 'Tomorrow') {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowEvents = initialList.slice().filter((event) => {
        const eventDate = new Date(event.properties.starts);
        return tomorrow.getDate() === eventDate.getDate()
          && tomorrow.getMonth() === eventDate.getMonth()
          && tomorrow.getFullYear() === eventDate.getFullYear();
      });
      setSearchDate(tomorrow);
      setResults(
        { ...results, filtered: tomorrowEvents },
      );
    } else if (tagName === 'Near you') {
      const nearYouEvents = results.byDistance.slice().filter((event) => {
        return event.distance <= 250;
      });
      setResults(
        { ...results, filtered: nearYouEvents },
      );
    } else {
      const bySearchTerm = results.byDistance.slice().filter(
        ({ properties: { name, buskerName, tags } }) => {
          const lowerName = name.toLowerCase();
          const lowerBuskerName = buskerName.toLowerCase();
          const searchedTerm = tagName.toLowerCase();
          const filteredEvents = lowerName
            .includes(searchedTerm)
            || lowerBuskerName.toLowerCase().includes(searchedTerm)
            || tags.indexOf(searchedTerm) !== -1;
          return filteredEvents;
        },
      );
      setResults(
        { ...results, filtered: bySearchTerm },
      );
    }
  };
  const handleSearchBtnClick = () => {
    onSearchSubmit(true);
  };
  const handleBackBtnClick = () => {
    SearchbarContext.setBarView(false);
  };
  if (SearchbarContext.isBarView) {
    return (
      <div id={styles.miniForm}>
        <button id={styles.miniBackBtn}
          onClick={handleBackBtnClick}
        ><FaLongArrowAltLeft />
        </button>
        <div className={styles.miniBar} id={styles.miniTermInput}>
          {/* <AutoComplete
            isBarView={SearchbarContext.isBarView}
            suggestions={suggestions}
            showValue={searchTerm}
            className={styles.miniSearchInput}
            onInputChange={onSearchTermChange}
            placeholder="Search" /> */}
          <input className={styles.miniSearchInput}
            onChange={onSearchTermChange}
            placeholder="Search"
            value = {searchTerm}
          />

          <button className={styles.miniInsideBtn}><FaSearch /></button>
        </div>
        <div className={styles.miniBar} id={styles.miniLocationInput}>
          <input className={styles.miniSearchInput}
            onChange={onSearchLocationChange}
            placeholder="Location"
            value={address}
          />
          <button className={styles.miniInsideBtn}><FaMapMarkerAlt /></button>
        </div>

        {/* <div id={styles.datePicker}>

        <DatePicker wrapperClassName={styles.datePicker} selected={searchDate}
          onChange={onDateChange}
          placeholderText='Select Date Here' /></div> */}
        <button id={styles.miniSearchBtn}
          onClick={onSearchSubmit}
        ><FaSearch />
        </button>

      </div>);
  }
  return (
    <div id={styles.searchContainer}>
      <label id={styles.title}>Find Your Next Performer:</label>

      <div id={styles.searchForm}>
        <div className={styles.searchBar} id={styles.upperSearchBar}>
          <AutoComplete className={styles.searchInput}
            showValue={searchTerm}
            suggestions={suggestions}
            onInputChange={onSearchTermChange}
            placeholder="Search name, performer or type of events" />
          {/* <input className={styles.searchInput}
            onChange={onSearchTermChange}
            placeholder="Search by event name"
          /> */}

          <button className={styles.insideBtn}><FaSearch /></button>
        </div>
        <div className={styles.searchBar}>
          <input className={styles.searchInput}
            onChange={onSearchLocationChange}
            placeholder="Location"
            value={address}
          />
          <button className={styles.insideBtn}><FaMapMarkerAlt /></button>
        </div>
        {/* <label>
          <DatePicker
            customInput={<FaRegCalendar />}/>
          <button id={styles.dateIcon}><FaRegCalendar /></button>
        </label> */}
        <div id={styles.datePicker}>

          <DatePicker wrapperClassName={styles.datePicker} selected={searchDate}
            onChange={onDateChange}
            placeholderText='Select Date Here' /></div>
      </div>
      <div id={styles.tagContainer}>
        {dummyTags.map((tag, index) => {
          return <button
            className={styles.searchTag}
            key={index} onClick={onTagClick}>
            {tag}
          </button>;
        })}
      </div>
      <button id={styles.searchBtn} className="master-button" onClick={handleSearchBtnClick}>Search</button>
    </div>
  );
};

export default SearchSection;
