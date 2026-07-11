import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import api from './api'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'hjamzybvifp56zwzgkv0',
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        api.post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name
        })
        .then(response => {
          callback(false, response.data)
        })
        .catch(error => {
          callback(true, error)
        })
      }
    }
  }
})

export default echo
