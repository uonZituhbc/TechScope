import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AdminMessages() {
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAndLoadMessages()
  }, [])

  const checkAdminAndLoadMessages = async () => {
    setLoading(true)

    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !user) {
      navigate('/login')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    await loadMessages()
    setLoading(false)
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('Unable to load messages. Please refresh the page.')
      return
    }

    setMessages(data || [])
  }

  const unreadCount = messages.filter(message => !message.is_read).length
  const readCount = messages.filter(message => message.is_read).length

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = [
        message.name,
        message.email,
        message.subject,
        message.message,
      ].join(' ').toLowerCase().includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && !message.is_read) ||
        (filter === 'read' && message.is_read)

      return matchesSearch && matchesFilter
    })
  }, [messages, search, filter])

  const openMessage = async (message) => {
    setSelectedMessage(message)

    if (!message.is_read) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', message.id)

      if (error) {
        setError('Message opened, but its read status could not be updated.')
        return
      }

      setMessages(current =>
        current.map(item =>
          item.id === message.id
            ? { ...item, is_read: true }
            : item
        )
      )

      setSelectedMessage({ ...message, is_read: true })
    }
  }

  const toggleReadStatus = async (message) => {
    const newStatus = !message.is_read

    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: newStatus })
      .eq('id', message.id)

    if (error) {
      setError('Unable to update message status.')
      return
    }

    setMessages(current =>
      current.map(item =>
        item.id === message.id
          ? { ...item, is_read: newStatus }
          : item
      )
    )

    if (selectedMessage?.id === message.id) {
      setSelectedMessage({ ...message, is_read: newStatus })
    }
  }

  const deleteMessage = async (message) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this message?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', message.id)

    if (error) {
      setError('Unable to delete this message.')
      return
    }

    setMessages(current =>
      current.filter(item => item.id !== message.id)
    )

    if (selectedMessage?.id === message.id) {
      setSelectedMessage(null)
    }
  }

  const replyByEmail = (message) => {
    const subject = `Re: ${message.subject}`

    const body = `Hello ${message.name},\n\nThank you for contacting TechScope.\n\n\n\nBest regards,\nTechScope Team`

    const mailto = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    window.location.href = mailto
  }

  if (loading) {
    return <div className="admin-messages-loading">Loading messages...</div>
  }

  return (
    <div className="admin-messages-page">

      <div className="admin-messages-header">
        <div>
          <span className="admin-messages-eyebrow">ADMINISTRATION</span>
          <h1>Messages Centre</h1>
          <p>Manage enquiries and messages received from TechScope visitors.</p>
        </div>

        <button
          className="admin-messages-refresh"
          onClick={() => {
            setError('')
            loadMessages()
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="admin-messages-error">{error}</div>
      )}

      <div className="admin-messages-stats">
        <div className="admin-message-stat">
          <span>Total Messages</span>
          <strong>{messages.length}</strong>
        </div>

        <div className="admin-message-stat unread">
          <span>Unread Messages</span>
          <strong>{unreadCount}</strong>
        </div>

        <div className="admin-message-stat read">
          <span>Read Messages</span>
          <strong>{readCount}</strong>
        </div>
      </div>

      <div className="admin-messages-layout">

        <section className="admin-messages-inbox">

          <div className="admin-messages-toolbar">
            <input
              type="search"
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="admin-message-list">

            {filteredMessages.length === 0 ? (
              <div className="admin-messages-empty">
                <span>📭</span>
                <h3>No messages found</h3>
                <p>Messages submitted through the Contact page will appear here.</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <button
                  key={message.id}
                  className={`admin-message-item ${
                    selectedMessage?.id === message.id ? 'selected' : ''
                  } ${!message.is_read ? 'unread-item' : ''}`}
                  onClick={() => openMessage(message)}
                >
                  <div className="admin-message-item-top">
                    <strong>{message.name}</strong>
                    <span>
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4>{message.subject}</h4>

                  <p>{message.message}</p>

                  <div className="admin-message-item-bottom">
                    <span>{message.email}</span>
                    {!message.is_read && (
                      <span className="admin-message-unread-badge">
                        Unread
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}

          </div>
        </section>

        <section className="admin-message-preview">

          {!selectedMessage ? (
            <div className="admin-message-placeholder">
              <span>✉️</span>
              <h3>Select a message</h3>
              <p>Choose a message from your inbox to read its full contents.</p>
            </div>
          ) : (
            <div className="admin-message-detail">

              <div className="admin-message-detail-header">
                <span>MESSAGE DETAILS</span>

                <button
                  className="admin-message-delete"
                  onClick={() => deleteMessage(selectedMessage)}
                >
                  Delete
                </button>
              </div>

              <h2>{selectedMessage.subject}</h2>

              <div className="admin-message-sender">
                <div className="admin-message-avatar">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{selectedMessage.name}</strong>
                  <span>{selectedMessage.email}</span>
                </div>
              </div>

              <div className="admin-message-date">
                Received on {new Date(selectedMessage.created_at).toLocaleString()}
              </div>

              <div className="admin-message-body">
                {selectedMessage.message}
              </div>

              <div className="admin-message-actions">

                <button
                  className="admin-message-reply"
                  onClick={() => replyByEmail(selectedMessage)}
                >
                  ✉️ Reply by Email
                </button>

                <button
                  className="admin-message-status"
                  onClick={() => toggleReadStatus(selectedMessage)}
                >
                  {selectedMessage.is_read
                    ? 'Mark as Unread'
                    : 'Mark as Read'}
                </button>

              </div>

            </div>
          )}

        </section>

      </div>

      <button
        className="admin-messages-back"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>

    </div>
  )
}