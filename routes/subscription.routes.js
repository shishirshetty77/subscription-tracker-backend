import { Router } from 'express'
import {
  createSubscription,
  getUserSubscriptions,
  deleteSubscription,
  cancelSubscription,
  updateSubscription,
  getSubscription,
  getAllSubscriptions,
  getUpcomingRenewals
} from '../controllers/subscription.controller.js'
import authorize from '../middlewares/auth.middleware.js'

const subscriptionRouter = Router()

// Specific routes MUST come before parameterized routes
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals)
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions)

// General routes
subscriptionRouter.get('/', getAllSubscriptions)
subscriptionRouter.post('/', authorize, createSubscription)

// Parameterized routes (must come after specific routes)
subscriptionRouter.get('/:id', getSubscription)
subscriptionRouter.put('/:id', authorize, updateSubscription)
subscriptionRouter.delete('/:id', authorize, deleteSubscription)
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription)

export default subscriptionRouter
