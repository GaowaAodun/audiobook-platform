import AudiobookCard from '@/components/audiobook/AudiobookCard';
import type { Audiobook } from '@/types';

async function getAudiobooks(): Promise<{ data: Audiobook[]; total: number }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/audiobooks?limit=20`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export default async function HomePage() {
  const { data: audiobooks, total } = await getAudiobooks();

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Latest Audiobooks</h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">{total} titles</p>
          )}
        </div>
        {audiobooks.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">No audiobooks available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {audiobooks.map((book) => (
              <AudiobookCard key={book.id} audiobook={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
