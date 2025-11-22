'use client'

import { useState, useEffect } from "react"
import { 
  getTopAnime, 
  getSeasonNow, 
  getPopularAnime, 
  Anime 
} from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { AnimeCard } from "@/components/anime-card"
import { SkeletonLoader } from "@/components/skeleton-loader"
import Link from "next/link"
import { ArrowRight, Star, TrendingUp, Calendar as CalendarIcon, PlayCircle } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [topAnimeData, setTopAnimeData] = useState<Anime[]>([])
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([])
  const [popularAnime, setPopularAnime] = useState<Anime[]>([])

  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingOthers, setLoadingOthers] = useState(true) // Menggabungkan loading Seasonal dan Popular

  const maxItems = 12
  const seasonalAnimeLimited = seasonalAnime.slice(0, maxItems)
  const popularAnimeLimited = popularAnime.slice(0, maxItems)

  useEffect(() => {
    // Step 1: fetch Top Anime
    const fetchTopAnime = async () => {
      setLoadingTop(true)
      try {
        const res = await getTopAnime()
        setTopAnimeData(res.data || [])
      } catch {
        setTopAnimeData([])
      } finally {
        setLoadingTop(false)
      }
    }
    fetchTopAnime()

    // Langsung panggil fetchOthers tanpa menunggu loadingTop selesai di Effect terpisah
    // Ini mengizinkan data top anime ditampilkan lebih dulu sambil data lain dimuat
    const fetchOthers = async () => {
      // Tidak perlu setLoadingOthers(true) lagi karena sudah diatur oleh Top Anime loading
      try {
        const [seasonRes, popularRes] = await Promise.all([getSeasonNow(), getPopularAnime()])
        setSeasonalAnime(seasonRes.data || [])
        setPopularAnime(popularRes.data || [])
      } catch {
        setSeasonalAnime([])
        setPopularAnime([])
      } finally {
        setLoadingOthers(false) // Set loadingOthers ke false setelah selesai
      }
    }

    // Panggil fetchOthers setelah fetching Top Anime (simulasi lazy loading/sequential)
    // Jika Anda ingin semua data di-fetch secara paralel sejak awal, masukkan fetchOthers ke effect pertama.
    // Kita pertahankan logika Anda yang memisahkan mereka.
    const runFetchers = async () => {
        const topPromise = fetchTopAnime();
        await topPromise; // Tunggu top anime selesai loading
        fetchOthers(); // Kemudian jalankan yang lain
    }
    // Karena kita tidak bisa memanggil `fetchOthers` di sini sebelum `fetchTopAnime` selesai tanpa Promise.all besar,
    // kita pertahankan 2 useEffect, tapi kita perbaiki logika loading di effect kedua.

    // PENTING: Untuk speed up, kita pertahankan 2 useEffect karena Anda ingin Top Charts muncul lebih dulu.
    // Namun, kita perbaiki bug di effect kedua:
  }, []) // Effect pertama hanya untuk Top Anime

  useEffect(() => {
    // Step 2: fetch Seasonal & Popular
    if (!loadingTop && loadingOthers) { // Hanya berjalan setelah Top selesai DAN Others belum selesai
      const fetchOthers = async () => {
        // Hapus setLoadingSeason(true) dan setLoadingPopular(true) di sini, 
        // cukup gunakan loadingOthers yang sudah true.
        try {
          const [seasonRes, popularRes] = await Promise.all([getSeasonNow(), getPopularAnime()])
          setSeasonalAnime(seasonRes.data || [])
          setPopularAnime(popularRes.data || [])
        } catch {
          setSeasonalAnime([])
          setPopularAnime([])
        } finally {
          setLoadingOthers(false) // SET KEDUA LOADING STATE KE FALSE
        }
      }
      fetchOthers()
    }
  }, [loadingTop, loadingOthers]) // Jalankan ketika loadingTop berubah (dari true ke false) atau loadingOthers masih true

  const heroAnimes = topAnimeData.slice(0, 2)
  const sideList = topAnimeData.slice(2, 7)
  const loadingSeason = loadingOthers // Gunakan state gabungan untuk rendering
  const loadingPopular = loadingOthers // Gunakan state gabungan untuk rendering

  return (
    // ... (JSX sisanya tetap sama)
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO & TOP CHARTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Hero Section (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {loadingTop 
              ? <SkeletonLoader type="home" count={2} /> 
              : heroAnimes.map((anime, index) => (
                <div key={anime.mal_id} className="relative flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all group h-full">
                  <div className="relative w-full sm:w-5/12 aspect-[16/9] sm:aspect-auto shrink-0 h-56 sm:h-auto overflow-hidden">
                    <Image src={anime.images.jpg.large_image_url} alt={anime.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority={index===0}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  <div className="flex flex-col p-5 sm:w-7/12 flex-grow h-full">
                    <div className="flex flex-col flex-grow">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                          <span>{anime.type}</span>
                        </div>
                        <Link href={`/anime/${anime.mal_id}`}>
                          <h1 className="text-xl md:text-2xl font-extrabold leading-tight hover:text-primary transition-colors line-clamp-2">
                            {anime.title}
                          </h1>
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1 font-bold text-yellow-500">
                          <Star className="fill-yellow-500" size={14} />
                          {anime.score}
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
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm mb-3">{anime.synopsis}</p>
                    </div>
                    <div className="pt-2 mt-auto">
                      <Link href={`/anime/${anime.mal_id}`} className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background/60 backdrop-blur-sm px-6 text-xs font-bold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Sidebar/Top Charts Section (Dibuat terlihat di semua ukuran) */}
          {/* Perubahan: Hapus 'hidden' dan ganti 'lg:flex' menjadi 'flex' */}
          <div className="lg:col-span-4 flex flex-col h-full"> 
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="text-primary" size={18}/> Top Charts
              </h3>
              <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            {loadingTop 
              ? <SkeletonLoader type="trending" count={5} /> 
              : (
                <div className="flex flex-col gap-3">
                  {sideList.map((anime, idx) => (
                    <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="flex gap-4 items-center p-3 rounded-xl bg-card hover:bg-secondary/40 border border-border/50 hover:border-border transition-all group">
                      <span className="text-xl font-black w-6 text-center text-muted-foreground group-hover:text-primary transition-colors">{idx + 3}</span>
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted shadow-sm border border-border/50">
                        <Image src={anime.images.jpg.image_url} alt={anime.title} fill className="object-cover group-hover:scale-110 transition-transform"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{anime.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Seasonal Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Season Now</h2>
            <Link href="/seasonal" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          {loadingSeason 
            ? <SkeletonLoader type="seasonal" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {seasonalAnimeLimited.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
              </div>
            )
          }
        </section>

        {/* Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">All Time Popular</h2>
            <Link href="/popular" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          {loadingPopular 
            ? <SkeletonLoader type="popular" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {popularAnimeLimited.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
              </div>
            )
          }
        </section>
      </div>
      {/* Responsive Footer */}
      {/* ... (Footer tetap sama) */}
    </main>
  )
}