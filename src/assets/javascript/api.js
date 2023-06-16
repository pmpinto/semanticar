const API_DEV_URL = 'http://localhost:8787'
const API_PROD_URL = 'https://semanticar-api.pmpinto.workers.dev'
const API_URL = process.env.ENV === 'production' ? API_PROD_URL : API_DEV_URL

const API = {
  call: async (endpoint, data) => {
    if (!endpoint) throw new Error('Endpoint must be provided and start with /')

    const options = { method: 'POST' }

    if (data) {
      options.body = JSON.stringify(data)
      options.headers = { 'Content-type': 'application/json' }
    }

    const response = await fetch(`${API_URL}${endpoint}`, options)
    const returnedData = await response.json()

    return returnedData
  }
}

export { API }
