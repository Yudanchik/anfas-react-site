import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./routes/home/route.tsx'),
  route('about', './routes/about/route.tsx'),
  route('contacts', './routes/contacts/route.tsx'),
  route('privacy', './routes/privacy/route.tsx'),
  route('projects', './routes/projects/route.tsx'),
  route('projects/:slug', './routes/project/route.tsx'),
  route('services', './routes/services/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
] satisfies RouteConfig
