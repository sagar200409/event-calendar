import { supabase } from './supabase.js'

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    document.getElementById('error-message').textContent = error.message
  } else {
    window.location.href = 'dashboard.html'
  }
})

// Logout
document.getElementById('logout')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '../index.html'
})

// Protect admin routes
supabase.auth.getSession().then(({ data: { session } }) => {
  if (window.location.pathname.includes('/admin/') && !session) {
    window.location.href = 'login.html'
  }
})