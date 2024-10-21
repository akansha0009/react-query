import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const {data, isError, isPending, error} = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({signal, id}),
    enabled: !!id
  })

  const {mutate, isPending: isPendingDeletion, isError: isErroDeletion, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events')
    }
  })

  const handleStopDelete = () => {
    setIsDeleting(false)
  }

  const handleStartDelete = () => {
    setIsDeleting(true)
  }

  const handleDeleteEvent = () => {
    mutate({id})
  }
  const formattedDate = new Date(data?.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <>
    {isDeleting && 
      <Modal onClose={handleStopDelete}>
        <h2>Are you Sure?</h2>
        <p>Are you sure you want to delete this event. This can not be undone.</p>  
        {isPendingDeletion && <p>Deleting, Please wait...</p>}
        {!isPendingDeletion && <div className='form-actions'>
          <button className='button-text' onClick={handleStopDelete} >Cancel</button>
          <button className='button-text' onClick={handleDeleteEvent} >Delete</button>
        </div>}
        {isErroDeletion && <ErrorBlock title='Failed to delete error' message={deleteError.info?.message || 'Failed to delete the event. Please try again later.'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <div className='center'>
        <LoadingIndicator />
      </div>}
      {isError && <ErrorBlock title='Failed to load the event.' message={error.info?.message || 'Failed to fetch event'} />}
      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete} >Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>}
    </>
  )
}
