import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ImageUploader from './UploadImage';
import styles from '../../styles/CreateEvent.module.css';
import Map from '../map/Map';

// const center = {
//   lng: -90.06911208674771,
//   lat: 29.954767355989652,
// };

const CreateEvent1 = ({
  center, handleDate, handleLocation, handleNext,
  handleEndDate, nextClickAttempted, date, endDateAndTime, loc,
  setEventLoc,
}) => {
  const mapContainerStyle = {
    height: '300px',
    width: 'auto',
  };

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [coords, setCoords] = useState('');

  useEffect(() => {
    setCoords(loc);
  }, [loc]);

  const onDateChange = (date) => {
    if (date !== null) {
      setStartDate(date);
      handleDate(date);
    }
  };

  const onEndDateChange = (date) => {
    if (date !== null) {
      setEndDate(date);
      handleEndDate(date);
    }
  };

  // const displayLocation = () => {
  //   console.log('loc', loc);
  //   let lat = loc.lat;
  //   let lng = loc.lng;
  //   return `lat: ${lat}, lng: ${lng}`
  // }

  return (
    <div className={styles.createEventContainer}>
      <div className='master-title'>Create Event</div>
      <form className={styles.formContainer}>
        <div className={nextClickAttempted && !date
          ? styles.validationWarning
          : styles.validationWarningHidden}> Please select a start date and time </div>
        <DatePicker className={styles.datePicker} selected={startDate} onChange={onDateChange} placeholderText='Select Start Date and Time' showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
        <div className={nextClickAttempted && !endDateAndTime
          ? styles.validationWarning
          : styles.validationWarningHidden}> Please select an end date and time</div>
        <DatePicker className={styles.datePicker} selected={endDate} onChange={onEndDateChange} placeholderText='Select End Date and Time' showTimeSelect dateFormat="MMMM d, yyyy h:mm aa"/>
        <div className={nextClickAttempted && !loc
          ? styles.validationWarning
          : styles.validationWarningHidden}> Please select a location </div>
        <input onChange={handleLocation}
       type='search' placeholder='Current Location' className={styles.masterSearchBar}
       value={coords
         ? `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`
         : ''} ></input>
      </form>
      <div className='mapContainer'>
        <Map center={center} onDrop={setEventLoc}
        containerStyle={mapContainerStyle} withInfoBoxes={false}/>
      </div>
      <button onClick={handleNext} className='master-button' text='Next'>
        Next
      </button>
    </div>
  );
};

const CreateEvent2 = ({ handleModifyConflict }) => (
  <div className={styles.conflictBoxContainer}>
    <div className='master-title'> Create Event </div>
    <div className={styles.conflictBox}>
      <div>{'Someone is performing at the same location. Do you still wish to have your event on this day and time?'}</div>
      <div className={styles.conflictButtonContainer}>
        <button
          className={styles.conflictButtonModify}
          onClick={() => handleModifyConflict(1)}>
            Modify
          </button>
        <button
          className={styles.conflictButtonProceed}
          onClick={() => handleModifyConflict(3)}>
            Proceed
          </button>
      </div>
    </div>
  </div>
);

const CreateEvent3 = ({
  handleName,
  handleDescription,
  handleTags,
  handleImage,
  handleAddMyEvent,
  handleUploadMode,
  uploadMode,
  image,
  submitAttempted,
  name,
  description,
}) => {
  const [uploadView, setUploadView] = useState(false);
  useEffect(() => {
    setUploadView(uploadMode);
  }, [uploadMode]);

  if (!uploadView) {
    return (
      <div className={styles.createEventContainer}>
        <div>
          <div className='master-title'>Create Event</div>
          <form className={styles.formContainer}>
            <div className={styles.smallTitle}> Event Name: </div>
            <div className={submitAttempted && !name
              ? styles.validationWarning
              : styles.validationWarningHidden}>
                Please enter an event name
              </div>
              <input onChange={handleName} type='search' className={styles.masterSearchBar} placeholder='Enter Event Name'></input>
            <div className={styles.smallTitle}> Description: </div>
            <div className={submitAttempted && !description
              ? styles.validationWarning
              : styles.validationWarningHidden}> Please enter a description </div>
              <textarea onChange={handleDescription} type='search' className={styles.descriptionField}placeholder='Enter Description'></textarea>
            <div className={styles.tagsDescription}>
              <div className={styles.smallTitle}> Tags </div>
              <div className={styles.tagSubtext}> (OPTIONAL - Separated By Comma)  </div>
            </div>
              <input onChange={handleTags} type='search' className={styles.masterSearchBar}placeholder='Add Tags (separated by comma)'></input>
          </form>
          {/* if image exists, render image, otherwise render button */}
          {image
            ? <img className={styles.uploadedImage} src={image} alt=''/>
            : <button onClick={handleUploadMode} type='text' className={styles.uploadImageButton}>Upload Image</button>
          }
        </div>
        <button onClick={handleAddMyEvent} type='text' className='master-button'>
          Add My Event
        </button>
      </div>
    );
  }
  return <ImageUploader handleImage={handleImage}/>;
};

// const dummyEventInfo = {
//   name: '',
//   description: '',
//   image: '',
//   date: '',
//   start: '',
//   end: '',
//   loc: '',
//   tags: ''
// }

const CreateEvent = ({ center }) => {
  const [createPage, setCreatePage] = useState(1);
  const [name, setEventName] = useState();
  const [description, setEventDescription] = useState();
  const [image, setEventImage] = useState();
  const [date, setEventDate] = useState();
  const [endDateAndTime, setEventEndDate] = useState();
  const [loc, setEventLoc] = useState();
  const [tags, setEventTags] = useState();
  const [uploadMode, setUploadMode] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [nextClickAttempted, setNextClickAttempted] = useState(false);
  const [isConflict, setIsConflict] = useState(true);

  useEffect(() => {
    setEventLoc(center);
  }, [center]);

  const handleDate = (date) => {
    setEventDate(date);
  };

  const handleEndDate = (date) => {
    setEventEndDate(date);
  };

  const handleLocation = (e) => {
    e.preventDefault();
    setEventLoc(e.target.value);
  };

  const handleName = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setEventName(e.target.value);
  };

  const handleDescription = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setEventDescription(e.target.value);
  };

  const handleTags = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setEventTags(e.target.value);
  };

  const handleNext = () => {
    if (date && endDateAndTime && loc) {
      setCreatePage(3)
    //   axios.get('endpoint that looks for conflicts').then(result => {
    //     // might be .conflict, might just be true/false
    //     if (result.data.conflict === true) {
    //       setCreatePage(2);
    //     } else {
    //       setCreatePage(3);
    //     }
    //   });
    // }
    // if (!date) {
    //   setNextClickAttempted(true);
    // }
    // if (!endDateAndTime) {
    //   setNextClickAttempted(true);
    }
  };

  const handleAddMyEvent = () => {
    console.log('ADD MY EVENT CLICKED!')
    if (name && description && image && date && endDateAndTime && loc) {
      let data = {
        // buskerID: How do I access performer ID - from context?
        name,
        description,
        tags: tags.split(','),
        starts: date,
        ends: endDateAndTime,
        lat: loc.lat,
        lng: loc.lng,
        photos: image,
      };
      console.log('data', JSON.stringify(data));
      axios.post('http://www.buskr.life/api/event', data)
        .then((result) => {
          console.log('results', result.data);
          // Redirect user back to their profile
          // Have profile re-render with event added to the list
        })
        .catch((err) => {
          console.log('Error posting event to database:', err);
        });
    }
    setSubmitAttempted(true);
  };

  const handleImage = (img) => {
    console.log('Upload Image button was clicked!');
    setEventImage(img);
    setUploadMode(false);
  };

  const handleUploadMode = () => {
    console.log('switch upload view!');
    setUploadMode(true);
  };

  const handleModifyConflict = (page) => {
    console.log({ page });
    if (page === 3) {
      setIsConflict(true);
    }
    setCreatePage(page);
  };

  if (createPage === 1) {
    return (
      <CreateEvent1
        center={center}
        handleDate={handleDate}
        handleEndDate={handleEndDate}
        handleLocation={handleLocation}
        handleNext={handleNext}
        nextClickAttempted={nextClickAttempted}
        loc={loc}
        date={date}
        endDateAndTime={endDateAndTime}
        setEventLoc={setEventLoc}
      />
    );
  }
  if (createPage === 2) {
    return (
      <CreateEvent2 handleModifyConflict={handleModifyConflict}/>
    );
  }
  if (createPage === 3) {
    return (
      <CreateEvent3
        handleName={handleName}
        handleDescription={handleDescription}
        handleTags={handleTags}
        handleImage={handleImage}
        handleAddMyEvent={handleAddMyEvent}
        handleUploadMode={handleUploadMode}
        uploadMode={uploadMode}
        image={image}
        submitAttempted={submitAttempted}
        name={name}
        description={description}
      />
    );
  }
  return <div></div>;
};

export default CreateEvent;
