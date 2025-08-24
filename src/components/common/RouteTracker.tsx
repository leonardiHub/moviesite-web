import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Track } from '../../lib/track';

export default function RouteTracker() {
  const location = useLocation();
  
  useEffect(() => {
    Track.pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  
  return null;
}
