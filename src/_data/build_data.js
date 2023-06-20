module.exports = () => {
  const now = new Date()
  return {
    date: now,
    timestamp: now.getTime(),
    year: now.getFullYear(),
    env: process.env.ENV
  }
}
