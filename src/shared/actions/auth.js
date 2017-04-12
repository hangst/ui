export const authRequested = () => ({
  type: 'AUTH_REQUESTED',
})

export const authReceived = (auth) => ({
  type: 'AUTH_RECEIVED',
  payload: {
    auth,
  },
})

export const meRequested = () => ({
  type: 'ME_REQUESTED',
})

export const meReceived = (me) => ({
  type: 'ME_RECEIVED',
  payload: {
    me,
  },
})

export function logout() {
  return {
    type: 'LOGOUT',
  }
}
