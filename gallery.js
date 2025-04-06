import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading students:', error)
    return
  }

  const gallery = document.getElementById('student-gallery')
  gallery.innerHTML = ''

  if (!students || students.length === 0) {
    gallery.innerHTML = '<p>No students found</p>'
    return
  }

  students.forEach(student => {
    const studentEl = document.createElement('div')
    studentEl.className = 'student-card'
    studentEl.innerHTML = `
      <img src="${student.image_url}" alt="${student.name}">
      <h3>${student.name}</h3>
    `
    gallery.appendChild(studentEl)
  })
})