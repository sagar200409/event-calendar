import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab + '-tab'
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById(tabId).classList.add('active')
    })
  })

  // Load initial data
  loadEvents()
  loadStudents()

  // Event form
  document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const title = document.getElementById('event-title').value
    const date = document.getElementById('event-date').value
    const description = document.getElementById('event-desc').value
    const imageFile = document.getElementById('event-image').files[0]

    // Upload image
    const filePath = `event-images/${Date.now()}_${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    // Save event
    const { error } = await supabase
      .from('events')
      .insert([{
        title,
        date,
        description,
        image_url: urlData.publicUrl
      }])

    if (error) {
      console.error('Error saving event:', error)
    } else {
      loadEvents()
      e.target.reset()
    }
  })

  // Student form
  document.getElementById('student-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const name = document.getElementById('student-name').value
    const imageFile = document.getElementById('student-image').files[0]

    // Upload image
    const filePath = `student-images/${Date.now()}_${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-images')
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('student-images')
      .getPublicUrl(filePath)

    // Save student
    const { error } = await supabase
      .from('students')
      .insert([{
        name,
        image_url: urlData.publicUrl
      }])

    if (error) {
      console.error('Error saving student:', error)
    } else {
      loadStudents()
      e.target.reset()
    }
  })
})

async function loadEvents() {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  const eventsList = document.getElementById('events-list')
  eventsList.innerHTML = ''

  if (error) {
    console.error('Error loading events:', error)
    return
  }

  if (!events || events.length === 0) {
    eventsList.innerHTML = '<p>No events found</p>'
    return
  }

  events.forEach(event => {
    const eventEl = document.createElement('div')
    eventEl.className = 'event-item'
    eventEl.innerHTML = `
      <img src="${event.image_url}" alt="${event.title}">
      <div class="event-info">
        <h3>${event.title}</h3>
        <p>${new Date(event.date).toLocaleDateString()}</p>
        <button class="delete-btn" data-id="${event.id}">Delete</button>
      </div>
    `
    eventsList.appendChild(eventEl)

    // Delete event
    eventEl.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this event?')) {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', event.id)

        if (!error) {
          loadEvents()
        }
      }
    })
  })
}

async function loadStudents() {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  const studentsList = document.getElementById('students-list')
  studentsList.innerHTML = ''

  if (error) {
    console.error('Error loading students:', error)
    return
  }

  if (!students || students.length === 0) {
    studentsList.innerHTML = '<p>No students found</p>'
    return
  }

  students.forEach(student => {
    const studentEl = document.createElement('div')
    studentEl.className = 'student-item'
    studentEl.innerHTML = `
      <img src="${student.image_url}" alt="${student.name}">
      <div class="student-info">
        <h3>${student.name}</h3>
        <button class="delete-btn" data-id="${student.id}">Delete</button>
      </div>
    `
    studentsList.appendChild(studentEl)

    // Delete student
    studentEl.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this student?')) {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', student.id)

        if (!error) {
          loadStudents()
        }
      }
    })
  })
}