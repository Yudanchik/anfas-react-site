import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./routes/home/route.tsx'),
  route('about', './routes/about/route.tsx'),
  route('blog', './routes/blog/route.tsx'),
  route('blog/:slug', './routes/article/route.tsx'),
  route('contacts', './routes/contacts/route.tsx'),
  route('cookies', './routes/cookies/route.tsx'),
  route('prices', './routes/prices/route.tsx'),
  route('prices/:categorySlug', './routes/price-category/route.tsx'),
  route('prices/thanks', './routes/price-thanks/route.tsx'),
  route('privacy', './routes/privacy/route.tsx'),
  route('projects', './routes/projects/route.tsx'),
  route('projects/:slug', './routes/project/route.tsx'),
  route('services', './routes/services/route.tsx'),
  route('services/:slug', './routes/service/route.tsx'),
  route('internal/estimate', './routes/internal/estimate/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
] satisfies RouteConfig
