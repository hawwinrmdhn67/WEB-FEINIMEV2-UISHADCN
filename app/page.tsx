import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Calendar as CalendarIcon, PlayCircle } from 'lucide-react'
import Image from 'next/image'

// --- Fungsi fetch eksternal langsung ---
async function fetchTopAnime() {
  const res = await fetch('https://api.example.com/top-anime')
  if (!res.ok) return { data: [] }
  return res.json()
}

async function fetchSeasonNow() {
  const res = await fetch('https://api.example.com/season-now')
  if (!res.ok) return { data: [] }
  return res.json()
}

async function fetchPopularAnime() {
  const res = await fetch('https://api.example.com/popular')
  if (!res.ok) return { data: [] }
  return res.json()
}

// Optional: SSG, update tiap 1 jam
export const revalidate = 3600 

export default async function Home() {
  const topAnimeData = await fetchTopAnime()
  const seasonAnimeData = await fetchSeasonNow()
  const popularAnimeData = await fetchPopularAnime()

  const heroAnimes = topAnimeData.data.slice(0, 2)
  const sideList = topAnimeData.data.slice(2, 7)
  const seasonalAnime = seasonAnimeData.data.slice(0, 12)
  const popularAnime = popularAnimeData.data.slice(0, 12)

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* --- HERO & TRENDING --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Hero */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {heroAnimes.map((anime, index) => (
              <div key={anime.mal_id} className="relative flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all h-full group">
                <div className="relative w-full sm:w-5/12 aspect-[16/9] sm:aspect-auto shrink-0 h-56 sm:h-auto overflow-hidden">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index === 0}
                  />
                  <div className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10 ${
                    index === 0 ? 'bg-primary' : 'bg-blue-600'
                  }`}>
                    <TrendingUp size={14} /> #{index + 1} Trending
                  </div>
                </div>

                <div className="flex flex-col justify-center p-5 sm:w-7/12 space-y-3">
                  <Link href={`/anime/${anime.mal_id}`} className="block">
                    <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                      {anime.title}
                    </h1>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 text-foreground font-bold">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} /> {anime.score}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={14} /> {anime.year || 'TBA'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <PlayCircle size={14} /> {anime.episodes || '?'} Eps
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
                    {anime.synopsis}
                  </p>
                  <div className="pt-2 mt-auto">
                    <Link 
                      href={`/anime/${anime.mal_id}`} 
                      className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background/60 backdrop-blur-sm px-6 text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex lg:col-span-4 flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="text-primary" size={18}/> Top Charts
              </h3>
              <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">View All</Link>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {sideList.map((anime, idx) => (
                <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="flex gap-4 items-center p-3 rounded-xl bg-card hover:bg-secondary/50 border border-border/50 hover:border-border transition-all group">
                  <span className="text-xl font-black w-6 text-center text-muted-foreground/50 group-hover:text-primary transition-colors">
                    {idx + 3}
                  </span>
                  <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0 bg-muted shadow-sm border border-border/50">
                    <Image src={anime.images.jpg.image_url} alt={anime.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {anime.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal & Popular */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Season Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {seasonalAnime.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">All Time Popular</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {popularAnime.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
          </div>
        </section>
      </div>
    </main>
  )
}
