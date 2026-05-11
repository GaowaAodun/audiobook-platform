import Image from 'next/image';
import Link from 'next/link';
import { BookAudio } from 'lucide-react';
import type { Audiobook } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  audiobook: Audiobook;
}

export default function AudiobookCard({ audiobook }: Props) {
  return (
    <Link href={`/audiobooks/${audiobook.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {audiobook.coverUrl ? (
            <Image
              src={audiobook.coverUrl}
              alt={audiobook.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookAudio className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant={audiobook.accessType === 'FREE' ? 'secondary' : 'default'} className="text-xs">
              {audiobook.accessType === 'FREE' ? 'Free' : audiobook.accessType === 'SUBSCRIPTION' ? 'Sub' : 'Buy'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{audiobook.title}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">{audiobook.author}</p>
          {audiobook.category && (
            <p className="mt-1 text-xs text-muted-foreground/70 truncate">{audiobook.category.name}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
