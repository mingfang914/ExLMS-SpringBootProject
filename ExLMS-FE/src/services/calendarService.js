import api from './api'

const calendarService = {
  getEvents: async (start, end) => {

    try {
      const response = await api.get('/calendar', {
        params: {
          start: start,
          end: end
        }
      });
      
      // Chuyển đổi dữ liệu backend sang format của FullCalendar
      const events = response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startAt,
        end: event.endAt,
        allDay: !event.endAt || (typeof event.startAt === 'string' && event.startAt.includes('00:00:00') && typeof event.endAt === 'string' && event.endAt.includes('23:59:59')),
        backgroundColor: event.color || '#6c63ff',
        borderColor: event.color || '#6c63ff',
        extendedProps: {
          type: event.eventType,
          sourceEntityId: event.sourceEntityId,
          sourceEntityType: event.sourceEntityType,
          description: event.description,
          groupId: event.groupId,
        }
      }));
      
      return events;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },
  syncCalendar: async () => {
    try {
      const response = await api.get('/calendar/sync-all');
      return response.data;
    } catch (error) {
      console.error('Error syncing calendar:', error);
      throw error;
    }
  }
}

export default calendarService
