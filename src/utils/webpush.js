import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY || 'your_public_key',
  process.env.VAPID_PRIVATE_KEY || 'your_private_key'
);

export default webpush;
