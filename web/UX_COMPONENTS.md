# UX Components Usage Guide

This guide shows you how to use the new UX enhancement components in your application.

---

## Toast Notifications

The toast notification system is globally available throughout the app.

### Basic Usage

```typescript
import { toast } from '@/components/ToastProvider';

// Success message
toast.success('İlan başarıyla oluşturuldu!');

// Error message
toast.error('Bir hata oluştu');

// Loading message
toast.loading('Yükleniyor...');

// Info message
toast('Bilgilendirme mesajı');
```

### Advanced Usage

```typescript
import { toast, showToast } from '@/components/ToastProvider';

// Promise-based toast (shows loading, then success/error)
await showToast.promise(
    fetch('/api/listings'),
    {
        loading: 'İlanlar yükleniyor...',
        success: 'İlanlar başarıyla yüklendi!',
        error: 'İlanlar yüklenemedi',
    }
);

// Custom duration
toast.success('Mesaj gönderildi', { duration: 2000 });

// Dismissible toast
const toastId = toast.loading('İşlem devam ediyor...');
// Later...
toast.dismiss(toastId);
toast.success('İşlem tamamlandı!');
```

### In Forms

```typescript
async function handleSubmit(data: FormData) {
    const toastId = toast.loading('İlan oluşturuluyor...');
    
    try {
        await createListing(data);
        toast.dismiss(toastId);
        toast.success('İlan başarıyla oluşturuldu!');
    } catch (error) {
        toast.dismiss(toastId);
        toast.error('İlan oluşturulamadı');
    }
}
```

---

## Loading States

### Page Loading

For full-page loading screens:

```typescript
import { PageLoading } from '@/components/LoadingStates';

export default function MyPage() {
    const [loading, setLoading] = useState(true);
    
    if (loading) {
        return <PageLoading text="İlanlar yükleniyor..." />;
    }
    
    return <div>Content...</div>;
}
```

### Inline Loading

For loading states within components:

```typescript
import { InlineLoading } from '@/components/LoadingStates';

{loading ? (
    <InlineLoading text="Veriler yükleniyor..." />
) : (
    <DataComponent />
)}
```

### Button Loading

For loading states in buttons:

```typescript
import { ButtonLoading } from '@/components/LoadingStates';

<button disabled={loading} className="...">
    {loading ? (
        <>
            <ButtonLoading />
            <span className="ml-2">Gönderiliyor...</span>
        </>
    ) : (
        'Gönder'
    )}
</button>
```

---

## Skeleton Loaders

### Card Skeleton

For loading cards:

```typescript
import { CardSkeleton, GridSkeleton } from '@/components/LoadingStates';

// Single card
{loading ? <CardSkeleton /> : <ListingCard listing={listing} />}

// Grid of cards
{loading ? <GridSkeleton count={6} /> : <ListingGrid listings={listings} />}
```

### List Item Skeleton

For list items:

```typescript
import { ListItemSkeleton } from '@/components/LoadingStates';

{loading ? (
    <>
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
    </>
) : (
    listings.map(listing => <ListItem key={listing.id} listing={listing} />)
)}
```

### Table Skeleton

For tables:

```typescript
import { TableSkeleton } from '@/components/LoadingStates';

{loading ? <TableSkeleton rows={10} /> : <DataTable data={data} />}
```

---

## Empty States

### Pre-configured Empty States

```typescript
import { EmptyStates } from '@/components/EmptyStates';

{listings.length === 0 ? (
    <EmptyStates.NoListings />
) : (
    <ListingGrid listings={listings} />
)}

// Available pre-configured states:
// - EmptyStates.NoListings
// - EmptyStates.NoSearchResults
// - EmptyStates.NoFavorites
// - EmptyStates.NoMessages
// - EmptyStates.NoQuestions
// - EmptyStates.NoNotifications
```

### Custom Empty State

```typescript
import { EmptyState } from '@/components/EmptyStates';

<EmptyState
    icon="package"
    title="Henüz ödeme yok"
    description="Ödeme geçmişiniz burada görünecek."
    action={{
        label: 'İlan Ekle',
        onClick: () => router.push('/listings/create'),
    }}
/>
```

### Error State

```typescript
import { ErrorState } from '@/components/EmptyStates';

{error ? (
    <ErrorState
        title="Veri yüklenemedi"
        description="İlanlar yüklenirken bir hata oluştu."
        onRetry={() => fetchListings()}
    />
) : (
    <ListingGrid listings={listings} />
)}
```

---

## Complete Example: Listing Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ToastProvider';
import { GridSkeleton } from '@/components/LoadingStates';
import { EmptyStates, ErrorState } from '@/components/EmptyStates';

export default function ListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    async function fetchListings() {
        setLoading(true);
        setError(false);
        
        try {
            const res = await fetch('/api/listings');
            if (!res.ok) throw new Error();
            
            const data = await res.json();
            setListings(data.listings);
            
            if (data.listings.length === 0) {
                toast('Henüz ilan yok', { icon: '📭' });
            }
        } catch (err) {
            setError(true);
            toast.error('İlanlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        const toastId = toast.loading('İlan siliniyor...');
        
        try {
            await fetch(`/api/listings/${id}`, { method: 'DELETE' });
            toast.dismiss(toastId);
            toast.success('İlan silindi');
            fetchListings();
        } catch {
            toast.dismiss(toastId);
            toast.error('İlan silinemedi');
        }
    }

    // Loading state
    if (loading) {
        return <GridSkeleton count={6} />;
    }

    // Error state
    if (error) {
        return <ErrorState onRetry={fetchListings} />;
    }

    // Empty state
    if (listings.length === 0) {
        return <EmptyStates.NoListings />;
    }

    // Success state
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
                <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={() => handleDelete(listing.id)}
                />
            ))}
        </div>
    );
}
```

---

## Best Practices

### 1. Always Show Loading States

```typescript
// ❌ Bad: Jumpy UI
{data && <Component data={data} />}

// ✅ Good: Smooth transition
{loading ? <Skeleton /> : <Component data={data} />}
```

### 2. Use Appropriate Toast Durations

```typescript
// Quick success messages
toast.success('Kaydedildi', { duration: 2000 });

// Errors (longer so user can read)
toast.error('Bir hata oluştu. Lütfen tekrar deneyin.', { duration: 5000 });

// Loading (dismissible)
const id = toast.loading('Yükleniyor...');
// ... later
toast.dismiss(id);
```

### 3. Handle Empty States Thoughtfully

```typescript
// ❌ Bad: No guidance
{items.length === 0 && <p>No items</p>}

// ✅ Good: Helpful empty state
{items.length === 0 && (
    <EmptyState
        icon="package"
        title="Henüz ürün yok"
        description="İlk ürününüzü ekleyerek başlayın!"
        action={{
            label: 'Ürün Ekle',
            onClick: () => router.push('/products/create'),
        }}
    />
)}
```

### 4. Combine Components

```typescript
function ListingsList() {
    const { listings, loading, error } = useListings();

    if (loading) return <GridSkeleton />;
    if (error) return <ErrorState onRetry={refetch} />;
    if (listings.length === 0) return <EmptyStates.NoListings />;

    return <Grid items={listings} />;
}
```

---

## Migration Tips

### Converting Existing Code

**Before:**
```typescript
{loading && <div>Loading...</div>}
{!loading && items.map(...)}
```

**After:**
```typescript
{loading ? <GridSkeleton /> : items.map(...)}
```

**Before:**
```typescript
alert('Success!');
```

**After:**
```typescript
toast.success('İşlem başarılı!');
```

---

## Component API Reference

### ToastProvider
- Auto-imported in root layout
- No props needed
- Global configuration in component file

### LoadingSpinner
- `size`: 'sm' | 'md' | 'lg'
- `text`: optional string

### EmptyState
- `icon`: 'package' | 'search' | 'question' | 'inbox'
- `title`: string
- `description`: string
- `action`: optional { label: string, onClick: () => void }

### ErrorState
- `title`: optional string
- `description`: optional string  
- `onRetry`: optional () => void
