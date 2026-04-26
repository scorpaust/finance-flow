import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri, {
        dbName: 'financeflow',
        bufferCommands: false,
      })
      console.log('✅ MongoDB connected successfully')
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
})
