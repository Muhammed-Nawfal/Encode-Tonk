import * as React from 'react';
import { useScheduleStore, ScheduleItem } from '../stores/scheduleStore';
import { Calendar as CalendarIcon, Clock, BookOpen, GraduationCap, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';

const typeIcons = {
  class: <BookOpen className="w-4 h-4" />,
  exam: <GraduationCap className="w-4 h-4" />,
  assignment: <CalendarIcon className="w-4 h-4" />
} as const;

const typeColors = {
  class: 'bg-[#49A078] hover:bg-[#49A078]/90 text-white',
  exam: 'bg-[#216869] hover:bg-[#216869]/90 text-white',
  assignment: 'bg-[#DCE1DE] hover:bg-[#DCE1DE]/90 text-[#1F2421]'
} as const;

const getEventStyle = (event: ScheduleItem) => {
  const baseStyle = typeColors[event.type];
  return event.completed ? 'bg-gray-200 hover:bg-gray-300 opacity-75 text-gray-600' : baseStyle;
};

type Notification = {
  id: string;
  message: string;
  type: ScheduleItem['type'];
  eventId: string;
  timestamp: Date;
};

function getNotifications(schedules: ScheduleItem[]): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [];

  schedules.forEach(event => {
    const eventTime = new Date(event.startTime);
    if (eventTime < now || event.completed) return;

    const timeUntil = eventTime.getTime() - now.getTime();
    const daysUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    switch (event.type) {
      case 'exam':
        if (daysUntil === 7) {
          notifications.push({
            id: `${event.id}-7d`,
            message: `Exam "${event.title}" for ${event.course} is in 7 days`,
            type: 'exam',
            eventId: event.id,
            timestamp: eventTime
          });
        }
        break;

      case 'assignment':
        if (daysUntil <= 5 && daysUntil > 0) {
          notifications.push({
            id: `${event.id}-${daysUntil}d`,
            message: `Assignment "${event.title}" for ${event.course} is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            type: 'assignment',
            eventId: event.id,
            timestamp: eventTime
          });
        }
        break;

      case 'class':
        if (daysUntil === 1) {
          notifications.push({
            id: `${event.id}-1d`,
            message: `Class "${event.title}" is tomorrow`,
            type: 'class',
            eventId: event.id,
            timestamp: eventTime
          });
        }
        if (hoursUntil <= 1 && hoursUntil > 0.5) {
          notifications.push({
            id: `${event.id}-1h`,
            message: `Class "${event.title}" starts in 1 hour`,
            type: 'class',
            eventId: event.id,
            timestamp: eventTime
          });
        }
        if (hoursUntil <= 0.5 && hoursUntil > 0) {
          notifications.push({
            id: `${event.id}-30m`,
            message: `Class "${event.title}" starts in 30 minutes`,
            type: 'class',
            eventId: event.id,
            timestamp: eventTime
          });
        }
        break;
    }
  });

  return notifications.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function Notifications({ notifications, onDismiss }: { notifications: Notification[], onDismiss: (id: string) => void }) {
  if (notifications.length === 0) return null;

  const getNotificationStyle = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'exam':
        return 'bg-[#216869] text-white font-medium border-[#216869]/50';
      case 'assignment':
        return 'bg-[#DCE1DE] text-[#1F2421] font-medium border-[#9CC5A1]/50';
      case 'class':
        return 'bg-[#49A078] text-white font-medium border-[#49A078]/50';
    }
  };

  return (
    <div className="space-y-3 mb-8">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-center justify-between p-4 border rounded-xl shadow-sm backdrop-blur-sm ${getNotificationStyle(notification.type)} transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-1.5 hover:bg-white/50 rounded-full transition-all duration-200 hover:scale-110"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Schedule() {
  const { schedules, addScheduleItem, removeScheduleItem, toggleComplete, updateScheduleItem } = useScheduleStore();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ScheduleItem | null>(null);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<{ date: Date; events: ScheduleItem[] } | null>(null);
  const [dismissedNotifications, setDismissedNotifications] = React.useState<Set<string>>(new Set());
  const [newItem, setNewItem] = React.useState<Omit<ScheduleItem, 'id' | 'completed'>>({
    type: 'class',
    title: '',
    course: '',
    startTime: '',
  });

  // Update notifications every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update notifications
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const notifications = React.useMemo(() => {
    return getNotifications(schedules).filter(n => !dismissedNotifications.has(n.id));
  }, [schedules, dismissedNotifications, currentDate]);

  const handleDismissNotification = (id: string) => {
    setDismissedNotifications(prev => new Set([...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        ...editingItem,
        title: editingItem.title,
        course: editingItem.course,
        type: editingItem.type,
        startTime: editingItem.startTime,
      });
      setEditingItem(null);
      
      // Update selectedDay if it exists
      if (selectedDay) {
        const updatedEvents = selectedDay.events.map(event => 
          event.id === editingItem.id ? {
            ...editingItem,
            title: editingItem.title,
            course: editingItem.course,
            type: editingItem.type,
            startTime: editingItem.startTime,
          } : event
        );
        setSelectedDay({
          ...selectedDay,
          events: updatedEvents
        });
      }
    } else {
      addScheduleItem({ ...newItem, completed: false });
      setNewItem({
        type: 'class',
        title: '',
        course: '',
        startTime: '',
      });
      setShowAddForm(false);

      // Update selectedDay if the new item belongs to the selected day
      if (selectedDay) {
        const newItemDate = new Date(newItem.startTime);
        const selectedDate = selectedDay.date;
        if (
          newItemDate.getDate() === selectedDate.getDate() &&
          newItemDate.getMonth() === selectedDate.getMonth() &&
          newItemDate.getFullYear() === selectedDate.getFullYear()
        ) {
          setSelectedDay({
            ...selectedDay,
            events: [...selectedDay.events, { ...newItem, id: Date.now().toString(), completed: false }]
          });
        }
      }
    }
  };

  const handleEdit = (event: ScheduleItem) => {
    setEditingItem(event);
  };

  // Also update selectedDay when toggling completion status
  const handleToggleComplete = (eventId: string) => {
    toggleComplete(eventId);
    if (selectedDay) {
      setSelectedDay({
        ...selectedDay,
        events: selectedDay.events.map(event =>
          event.id === eventId ? { ...event, completed: !event.completed } : event
        )
      });
    }
  };

  // Update selectedDay when removing an item
  const handleRemoveItem = (eventId: string) => {
    removeScheduleItem(eventId);
    if (selectedDay) {
      setSelectedDay({
        ...selectedDay,
        events: selectedDay.events.filter(event => event.id !== eventId)
      });
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const getPreviousMonthDays = (date: Date) => {
    const lastDayOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const firstDayOfMonth = getFirstDayOfMonth(date);
    return Array.from({ length: firstDayOfMonth }, (_, i) => ({
      dayNumber: lastDayOfPrevMonth - firstDayOfMonth + i + 1,
      date: new Date(date.getFullYear(), date.getMonth() - 1, lastDayOfPrevMonth - firstDayOfMonth + i + 1),
      events: []
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatEventTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const previousMonthDays = getPreviousMonthDays(currentDate);
  
  const days = [
    ...previousMonthDays,
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
      const dayEvents = schedules.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === i + 1 &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
      });
      return { dayNumber: i + 1, date, events: dayEvents };
    }),
    ...Array.from({ length: 42 - daysInMonth - firstDayOfMonth }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i + 1);
      return { dayNumber: i + 1, date, events: [] };
    })
  ];

  const groupEventsByType = (events: ScheduleItem[]) => {
    return events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = [];
      }
      acc[event.type].push(event);
      return acc;
    }, {} as Record<ScheduleItem['type'], ScheduleItem[]>);
  };

  return (
    <div className="flex gap-6 max-w-[90rem] mx-auto p-6">
      <div className="flex-1">
        <Notifications notifications={notifications} onDismiss={handleDismissNotification} />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1F2421] to-[#1F2421]/80 bg-clip-text text-transparent">
              Schedule
            </h1>
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm p-1">
              <button 
                onClick={previousMonth} 
                className="p-2 hover:bg-[#9CC5A1]/20 rounded-md transition-colors"
              >
                ←
              </button>
              <span className="text-lg font-medium px-2">{formatDate(currentDate)}</span>
              <button 
                onClick={nextMonth} 
                className="p-2 hover:bg-[#9CC5A1]/20 rounded-md transition-colors"
              >
                →
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#49A078] text-white px-5 py-2.5 rounded-lg hover:bg-[#49A078]/90 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {days.map((day, index) => day && (
              <div
                key={index}
                onClick={() => setSelectedDay({ date: day.date, events: day.events })}
                className={`
                  min-h-[100px] p-2 border border-gray-200 relative transition-all duration-200
                  ${day.date.getMonth() === currentDate.getMonth() && day.date.getFullYear() === currentDate.getFullYear() ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                  ${selectedDay?.date.getDate() === day.date.getDate() &&
                    selectedDay?.date.getMonth() === day.date.getMonth() &&
                    selectedDay?.date.getFullYear() === day.date.getFullYear()
                      ? 'ring-2 ring-[#49A078] ring-opacity-50' : ''}
                  ${day.date.getDate() === new Date().getDate() &&
                    day.date.getMonth() === new Date().getMonth() &&
                    day.date.getFullYear() === new Date().getFullYear()
                      ? 'bg-[#9CC5A1]/10' : ''}
                  group cursor-pointer
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`
                    text-lg font-medium mb-1 transition-colors duration-200
                    ${day.date.getMonth() === currentDate.getMonth() && day.date.getFullYear() === currentDate.getFullYear() ? 'text-gray-900' : 'text-gray-400'}
                    ${day.date.getDate() === new Date().getDate() &&
                      day.date.getMonth() === new Date().getMonth() &&
                      day.date.getFullYear() === new Date().getFullYear()
                        ? 'text-[#216869] font-semibold' : ''}
                    group-hover:scale-110 transform origin-top-left transition-transform duration-200
                  `}>
                    {day.dayNumber}
                  </span>
                  <div className="flex-1 space-y-1">
                    {day.events.slice(0, 3).map((event, index) => (
                      <div
                        key={event.id}
                        className={`
                          ${typeColors[event.type]} p-1.5 rounded-md text-sm
                          transition-all duration-200 hover:translate-x-1
                          ${event.completed ? 'opacity-50' : ''}
                          shadow-sm hover:shadow-md
                        `}
                      >
                        <div className="flex items-center gap-1">
                          {typeIcons[event.type]}
                          <span className="truncate text-xs font-medium">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium mt-1 hover:text-blue-600 transition-colors duration-200">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDay && (
        <div className="w-96 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6 transition-all duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {selectedDay.date.toLocaleDateString('en-US', { 
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {Object.entries(groupEventsByType(selectedDay.events)).map(([type, events]) => (
            <div key={type} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700">
                {typeIcons[type as keyof typeof typeIcons]}
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </h3>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg ${getEventStyle(event)} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={`text-base font-semibold ${event.completed ? 'line-through opacity-70' : ''}`}>
                          {event.title}
                        </div>
                        <div className={`text-sm mt-1 font-medium ${event.completed ? 'opacity-70' : event.type === 'assignment' ? 'text-[#1F2421]' : 'text-white/90'}`}>
                          {event.course}
                        </div>
                        <div className={`text-sm mt-2 flex items-center gap-1.5 ${
                          event.completed ? 'opacity-70' : event.type === 'assignment' ? 'text-[#1F2421]/80' : 'text-white/80'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {formatEventTime(event.startTime)}
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-3">
                        <button
                          onClick={() => handleEdit(event)}
                          className={`p-1.5 rounded hover:bg-white/20 transition-all duration-200 hover:scale-105 ${
                            event.type === 'assignment' ? 'text-[#1F2421]/70 hover:text-[#49A078]' : 'text-white/70 hover:text-white'
                          }`}
                          aria-label="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleComplete(event.id)}
                          className={`p-1.5 rounded hover:bg-white/20 transition-all duration-200 hover:scale-105 ${
                            event.type === 'assignment' 
                              ? event.completed ? 'text-[#216869]' : 'text-[#1F2421]/70 hover:text-[#216869]' 
                              : event.completed ? 'text-white' : 'text-white/70 hover:text-white'
                          }`}
                          aria-label={event.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="w-4 h-4 transition-transform duration-200 transform scale-110" />
                          ) : (
                            <XCircle className="w-4 h-4 transition-transform duration-200" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveItem(event.id)}
                          className={`p-1.5 rounded hover:bg-white/20 transition-all duration-200 hover:scale-105 ${
                            event.type === 'assignment' ? 'text-[#1F2421]/70 hover:text-[#216869]' : 'text-white/70 hover:text-white'
                          }`}
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedDay.events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-2">No events scheduled</div>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Add one now
              </button>
            </div>
          )}
        </div>
      )}

      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Schedule Item' : 'Add New Schedule Item'}
              </h2>
              <button
                onClick={() => editingItem ? setEditingItem(null) : setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['class', 'exam', 'assignment'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => editingItem 
                          ? setEditingItem({ ...editingItem, type })
                          : setNewItem({ ...newItem, type })
                        }
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          (editingItem ? editingItem.type : newItem.type) === type
                            ? 'border-[#49A078] bg-[#9CC5A1]/10 text-[#1F2421]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {typeIcons[type]}
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editingItem ? editingItem.title : newItem.title}
                    onChange={(e) => editingItem 
                      ? setEditingItem({ ...editingItem, title: e.target.value })
                      : setNewItem({ ...newItem, title: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#49A078] focus:border-[#49A078] transition-shadow"
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input
                    type="text"
                    value={editingItem ? editingItem.course : newItem.course}
                    onChange={(e) => editingItem
                      ? setEditingItem({ ...editingItem, course: e.target.value })
                      : setNewItem({ ...newItem, course: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#49A078] focus:border-[#49A078] transition-shadow"
                    placeholder="Enter course name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editingItem ? editingItem.startTime : newItem.startTime}
                    onChange={(e) => editingItem
                      ? setEditingItem({ ...editingItem, startTime: e.target.value })
                      : setNewItem({ ...newItem, startTime: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#49A078] focus:border-[#49A078] transition-shadow"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => editingItem ? setEditingItem(null) : setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#49A078] text-white rounded-lg hover:bg-[#49A078]/90 transition-colors shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}