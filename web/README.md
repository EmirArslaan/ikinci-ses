# İkinci Ses - Second-Hand Musical Instruments Marketplace

A comprehensive marketplace platform for buying and selling second-hand musical instruments, built with Next.js, MongoDB, and real-time messaging.

## ✨ Features

- **User Authentication** - JWT-based authentication with email and phone verification
- **Listing Management** - Create, edit, and manage instrument listings with image uploads
- **Real-time Messaging** - Socket.io powered instant messaging between buyers and sellers
- **Q&A System** - Ask and answer questions about instruments
- **Musician Meetups** - Create and discover local musician events
- **Reviews & Ratings** - User review system with trust badges
- **Payment Integration** - PayTR payment gateway for listing promotions
- **Admin Panel** - Comprehensive admin dashboard for content moderation
- **Advanced Search** - Filter by category, brand, price, condition, and more
- **Favorites** - Save and track favorite listings
- **Notifications** - Real-time notifications for messages, approvals, and updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` and fill in your configuration values. See [Environment Variables](#environment-variables) section below.

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database with sample data
npm run seed
```

5. **Start development servers**
```bash
# Option 1: Run both servers with one command (recommended)
npm run dev:all

# Option 2: Run servers separately in different terminals
npm run dev        # Next.js server (port 3000)
npm run dev:socket # Socket.io server (port 3001)
```

6. **Open your browser**
```
http://localhost:3000
```

## 📋 Environment Variables

Copy `.env.example` to `.env` and configure the following:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/ikinci_el_muzik` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

### Email (Optional but recommended)

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | `your-app-password` |
| `EMAIL_FROM` | From address | `İkinci Ses <noreply@ikincises.com>` |

See [GMAIL_SETUP.md](GMAIL_SETUP.md) for Gmail configuration instructions.

### Payment (Optional)

| Variable | Description |
|----------|-------------|
| `PAYTR_MERCHANT_ID` | PayTR merchant ID |
| `PAYTR_MERCHANT_KEY` | PayTR merchant key |
| `PAYTR_MERCHANT_SALT` | PayTR merchant salt |

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | **Recommended:** Run both Next.js and Socket.io servers simultaneously |
| `npm run dev` | Run Next.js development server only (port 3000) |
| `npm run dev:socket` | Run Socket.io server only (port 3001) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |

## 📁 Project Structure

```
web/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── public/                # Static files
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes (42 endpoints)
│   │   ├── admin/        # Admin panel pages
│   │   ├── auth/         # Authentication pages
│   │   ├── listings/     # Listing pages
│   │   ├── messages/     # Messaging interface
│   │   ├── meetups/      # Meetup pages
│   │   ├── profile/      # User profile pages
│   │   └── questions/    # Q&A pages
│   ├── components/       # Reusable React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── auth.ts       # Authentication utilities
│   │   ├── prisma.ts     # Prisma client
│   │   ├── cloudinary.ts # Image upload
│   │   ├── email.ts      # Email sending
│   │   ├── payment.ts    # Payment processing
│   │   └── validations/  # Zod schemas
│   ├── middleware.ts     # Next.js middleware (rate limiting, CORS, security)
│   └── types/            # TypeScript type definitions
├── socket-server.ts      # Standalone Socket.io server
├── .env.example          # Environment variables template
└── package.json
```

## 🔒 Security Features

- **Rate Limiting** - IP-based rate limiting on all API endpoints
- **CORS Protection** - Configured cross-origin resource sharing
- **Security Headers** - HSTS, X-Frame-Options, CSP, etc.
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - Zod schemas for all user inputs

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## 🖼️ Image Optimization

Images are automatically optimized and uploaded to Cloudinary. See [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) for details.

## 🔌 Real-time Features

The application uses Socket.io for real-time features:
- Instant messaging
- Online status indicators
- Typing indicators
- Read receipts
- Live notifications

See [SOCKET_SETUP.md](SOCKET_SETUP.md) for Socket.io configuration.

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Socket.io Connection Errors
```bash
# Make sure both servers are running
npm run dev:all

# Check if port 3001 is available
lsof -i :3001
```

### Image Upload Failures
- Verify Cloudinary credentials in `.env`
- Check file size limits (10MB max)
- Ensure file format is supported (jpg, png, webp)

### Email Sending Issues
- For Gmail: Use App Passwords, not your regular password
- Enable "Less secure app access" if using Gmail
- See [GMAIL_SETUP.md](GMAIL_SETUP.md)

## 📚 Additional Documentation

- [SECURITY.md](SECURITY.md) - Security features and configuration
- [GMAIL_SETUP.md](GMAIL_SETUP.md) - Gmail SMTP setup guide
- [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) - Image handling guide
- [SOCKET_SETUP.md](SOCKET_SETUP.md) - Socket.io configuration

## 🚀 Deployment

### Production Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` in `.env`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production MongoDB database
- [ ] Set up Cloudinary production environment
- [ ] Configure email service
- [ ] Update CORS allowed origins in `middleware.ts`
- [ ] Run `npm run build` to verify production build
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables on hosting platform

### Recommended Platforms

- **Vercel** - Easiest deployment for Next.js
- **Railway** - Good for MongoDB + Node.js
- **AWS/DigitalOcean** - Full control

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test thoroughly
5. Submit a pull request

## 📝 License

[Add your license here]

## 🙋‍♂️ Support

For issues and questions:
- Check existing documentation
- Review troubleshooting section
- Open an issue on GitHub

