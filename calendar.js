import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date()
  let currentMonth = today.getMonth()
  let currentYear = today.getFullYear()

  // Navigation
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--
    if (currentMonth < 0) {
      currentMonth = 11
      currentYear--
    }
    renderCalendar(currentMonth, currentYear)
  })

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
    renderCalendar(currentMonth, currentYear)
  })

  // Initial render
  renderCalendar(currentMonth, currentYear)
  loadUpcomingEvents()
})

async function renderCalendar(month, year) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"]
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`

  const calendarEl = document.getElementById('calendar')
  calendarEl.innerHTML = ''

  // Get first day and days in month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Add empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarEl.appendChild(createDayElement(''))
  }

  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEl = createDayElement(day)
    
    // Check for events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('date', dateStr)

    if (events && events.length > 0) {
      dayEl.classList.add('has-event')
      dayEl.addEventListener('click', () => showEventModal(events[0]))
    }
    
    calendarEl.appendChild(dayEl)
  }
}

function createDayElement(day) {
  const dayEl = document.createElement('div')
  dayEl.className = 'day'
  dayEl.textContent = day
  return dayEl
}

async function loadUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(5)

  const eventsList = document.getElementById('events-list')
  eventsList.innerHTML = ''

  if (!events || events.length === 0) {
    eventsList.innerHTML = '<p>No upcoming events</p>'
    return
  }

  events.forEach(event => {
    const eventEl = document.createElement('div')
    eventEl.className = 'event-item'
    eventEl.innerHTML = `
      <h3>${event.title}</h3>
      <p>${new Date(event.date).toLocaleDateString()}</p>
    `
    eventEl.addEventListener('click', () => showEventModal(event))
    eventsList.appendChild(eventEl)
  })
}

function showEventModal(event) {
  document.getElementById('modal-title').textContent = event.title
  document.getElementById('modal-date').textContent = new Date(event.date).toLocaleDateString()
  document.getElementById('modal-image').src = event.image_url
  document.getElementById('modal-desc').textContent = event.description
  document.getElementById('event-modal').style.display = 'block'
}

// Close modal
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('event-modal').style.display = 'none'
})