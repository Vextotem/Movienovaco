/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

interface Source {
    name: string;
    url: string;
}

const SERIES_URL_PARAMS = 'nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=#E50914';
const MAX_VIEWED_ITEMS = 15;
const SOURCE_TIMEOUT_MS = 8000;

const LOCAL_STORAGE_KEYS = {
    selectedSource: 'selectedSource',
    viewed: 'viewed'
} as const;

const SOURCES: Source[] = [
    { name: '4K', url: 'https://player.videasy.net' },
    { name: 'Mist', url: 'https://play.xpass.top/e' },
    { name: 'Peach', url: 'https://peachify.top/embed' },
    { name: 'Pass', url: 'https://vidcore.net' },
    { name: 'Mistify', url: 'https://vaplayer.ru/embed' },
    { name: 'Simplify', url: 'https://zxcstream.xyz/player' },
    { name: 'Asia', url: 'https://nhdapi.com/embed' },
    { name: 'Cine', url: 'https://cinesrc.st/embed' },
    { name: 'Vidmux', url: 'https://vidlux.site/embed' },
    { name: 'Pablo', url: 'https://vidsrc.cc/v3/embed' },
    { name: 'Braflix', url: 'https://api.cineby.homes/embed' },
    { name: 'India', url: 'https://vidup.to' },
    { name: 'Diablo', url: 'https://tanime.tv' },
    { name: 'Italian', url: 'https://vixsrc.to' },
    { name: 'Azute', url: 'https://vidrock.ru' },
    { name: 'Vidind', url: 'https://player.vidify.top/embed' },
    { name: '4K2', url: 'https://www.vidking.net/embed' },
    { name: 'Prime', url: 'https://player.vidrush.net/embed' },
    { name: 'Main', url: 'https://player.vidzee.wtf/embed' },
    { name: '4KHD', url: 'https://mapple.uk/watch' },
    { name: 'Vidora', url: 'https://anyembed.xyz/embed' },
    { name: 'Fade', url: 'https://rivestream.org/embed' },
    { name: 'Vidlink', url: 'https://vidlink.pro' },
    { name: 'Nero', url: 'https://vidfast.pro' },
    { name: 'Flixify', url: 'https://vidflix.club' },
    { name: 'Astra', url: 'https://vidsrc.su/embed' },
    { name: 'Vidplay', url: 'https://vidsrc.cc/v2/embed' },
    { name: 'Hindi', url: 'https://vidsrc.wtf/api/1' },
    { name: 'Vidsrc', url: 'https://vidsrcme.ru/embed' },
    { name: '2embed', url: 'https://www.2embed.stream/embed' },
    { name: 'PrimeWire', url: 'https://primesrc.me/embed' },
    { name: 'French', url: 'https://frembed.one/api' },
    { name: 'Club', url: 'https://moviesapi.to' },
    { name: 'Sage', url: 'https://111movies.com' },
    { name: 'Aura', url: 'https://player.autoembed.app/embed' },
    { name: 'Spanish', url: 'https://play.modocine.com/play.php/embed' },
    { name: 'Flix', url: 'https://player.vidplus.to/embed' },
    { name: 'Portuguese', url: 'https://superflixapi.buzz' }
];

const DEFAULT_SOURCE = SOURCES[0].name;
const isValidSource = (name: string | null): name is string =>
    !!name && SOURCES.some(s => s.name === name);

function constructMovieUrl(baseSource: string, source: string, id: string): string {
    const PRIMESRC_PARAMS = '&fallback=true&server_order=PrimeVid,Voe,Dood';

    switch (source) {
        case 'Simplify':
            return `${baseSource}/movie/${id}?autoplay=true&color=addc35&back=false&domainAd=braflix.win`;
        case 'Hindi':
            return `${baseSource}/movie/?id=${id}&color=ffffff`;
        case '4K2':
            return `${baseSource}/movie/${id}`;
        case 'Prime':
            return `${baseSource}/${id}`;
        case '4KHD':
            return `${baseSource}/movie/${id}?autoPlay=true&theme=addc35`;
        case 'PrimeWire':
            return `${baseSource}/movie?tmdb=${id}${PRIMESRC_PARAMS}`;
        case 'French':
            return `${baseSource}/film.php?id=${id}`;
        case 'Fade':
            return `${baseSource}?type=movie&id=${id}&sendMetadata=true`;
        case 'Vidora':
            return `${baseSource}/tmdb-movie-${id}`;
        case 'India':
            return `${baseSource}/movie/${id}?autoPlay=true`;
        case 'Italian':
            return `${baseSource}/movie/${id}?autoplay=true&lang=it`;
        case 'Portuguese':
            return `${baseSource}/filme/${id}`;
        case 'Spanish':
        default:
            return `${baseSource}/movie/${id}`;
    }
}

function constructSeriesUrl(
    baseSource: string,
    source: string,
    id: string,
    season: number,
    episode: number
): string {
    const PRIMESRC_PARAMS = '&third_party_fallback=true&server_order=PrimeVid,Voe,Dood';
    let url: string;

    switch (source) {
        case 'Simplify':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autoplay=true&color=addc35&back=false&domainAd=braflix.win`;
            break;
        case 'Hindi':
            return `${baseSource}/tv/?id=${id}&s=${season}&e=${episode}&next-ep=${episode + 1}&color=ffffff`;
        case '4K2':
            url = `${baseSource}/tv/${id}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`;
            break;
        case 'Prime':
            url = `${baseSource}/${id}/${season}/${episode}`;
            break;
        case '4KHD':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autoPlay=true&theme=addc35`;
            break;
        case 'PrimeWire':
            url = `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}${PRIMESRC_PARAMS}`;
            break;
        case 'French':
            url = `${baseSource}/serie.php?id=${id}&sa=${season}&epi=${episode}`;
            break;
        case 'Club':
            url = `${baseSource}/tv/${id}-${season}-${episode}`;
            break;
        case 'Fade':
            url = `${baseSource}?type=tv&id=${id}&season=${season}&episode=${episode}&autoplay=true&sendMetadata=true`;
            break;
        case 'Vidora':
            url = `${baseSource}/tmdb-tv-${id}-${season}-${episode}`;
            break;
        case 'India':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autoPlay=true`;
            break;
        case 'Italian':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autoplay=true&lang=it`;
            break;
        case 'Portuguese':
            url = `${baseSource}/serie/${id}/${season}/${episode}`;
            break;
        case '4K':
            url = `${baseSource}/tv/${id}/${season}/${episode}?${SERIES_URL_PARAMS}`;
            break;
        case 'Vidlink':
            url = `${baseSource}/tv/${id}/${season}/${episode}?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`;
            break;
        case 'Braflix':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autonext=1&ds_lang=en`;
            break;
        default:
            url = `${baseSource}/tv/${id}/${season}/${episode}`;
            break;
    }

    return url;
}

function getLocalStorageValue(key: string, defaultValue: string): string {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch {
        return defaultValue;
    }
}

function setLocalStorageValue(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
}

export default function Watch() {
    const nav = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [search] = useSearchParams();

    // Derive playback target straight from the URL. Keeping this in state meant
    // the first render always built a *movie* URL, even for series.
    const target = useMemo(() => {
        const rawS = search.get('s');
        const rawE = search.get('e');

        if (!rawS || !rawE) {
            return { type: 'movie' as MediaType, season: 1, episode: 1, valid: true };
        }

        const season = parseInt(rawS, 10);
        const episode = parseInt(rawE, 10);
        const valid = Number.isInteger(season) && Number.isInteger(episode) && season >= 1 && episode >= 1;

        return { type: 'series' as MediaType, season, episode, valid };
    }, [search]);

    const { type, season, episode, valid } = target;

    const [data, setData] = useState<Movie | Series>();
    const [maxEpisodes, setMaxEpisodes] = useState(0);
    const [episodesLoaded, setEpisodesLoaded] = useState(type === 'movie');
    const [loading, setLoading] = useState(true);
    const [allSourcesFailed, setAllSourcesFailed] = useState(false);

    const [source, setSource] = useState(() => {
        const urlSource = search.get('src');
        if (isValidSource(urlSource)) return urlSource;

        const stored = getLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, DEFAULT_SOURCE);
        return isValidSource(stored) ? stored : DEFAULT_SOURCE;
    });

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const attemptedRef = useRef<Set<string>>(new Set());

    const sourceUrl = useMemo(() => {
        if (!id || !valid) return '';

        const sourceData = SOURCES.find(s => s.name === source);
        if (!sourceData) return '';

        return type === 'movie'
            ? constructMovieUrl(sourceData.url, source, id)
            : constructSeriesUrl(sourceData.url, source, id, season, episode);
    }, [source, type, id, season, episode, valid]);

    /* ---------------------------------------------------------------- */
    /* Source fallback                                                   */
    /* ---------------------------------------------------------------- */

    // Only picks sources it hasn't already burned, so it can't loop forever.
    const advanceSource = useCallback(() => {
        attemptedRef.current.add(source);

        const next = SOURCES.find(s => !attemptedRef.current.has(s.name));
        if (!next) {
            console.warn('All sources failed to load.');
            setAllSourcesFailed(true);
            setLoading(false);
            return;
        }

        console.warn(`${source} failed, falling back to ${next.name}`);
        setSource(next.name);
    }, [source]);

    // Explicit user choice: reset the burn list and persist. Auto-fallbacks are
    // deliberately NOT persisted — otherwise a dead source becomes the default.
    const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSource = e.target.value;
        attemptedRef.current = new Set();
        setAllSourcesFailed(false);
        setSource(newSource);
        setLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, newSource);
    }, []);

    useEffect(() => {
        if (!sourceUrl) return;

        setLoading(true);

        const iframe = iframeRef.current;
        if (!iframe) return;

        // Single guard shared by load / error / timeout so a source resolves once.
        let resolved = false;

        const succeed = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            setLoading(false);
        };

        const fail = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            advanceSource();
        };

        const timer = setTimeout(fail, SOURCE_TIMEOUT_MS);

        iframe.addEventListener('load', succeed);
        iframe.addEventListener('error', fail);

        return () => {
            clearTimeout(timer);
            iframe.removeEventListener('load', succeed);
            iframe.removeEventListener('error', fail);
        };
    }, [sourceUrl, advanceSource]);

    // ?src= override, applied whenever the query string changes.
    useEffect(() => {
        const urlSource = search.get('src');
        if (isValidSource(urlSource)) {
            attemptedRef.current = new Set();
            setAllSourcesFailed(false);
            setSource(urlSource);
        }
    }, [search]);

    /* ---------------------------------------------------------------- */
    /* Data                                                              */
    /* ---------------------------------------------------------------- */

    const addViewed = useCallback((mediaData: MediaShort): void => {
        try {
            const viewedStr = localStorage.getItem(LOCAL_STORAGE_KEYS.viewed);
            const viewed: MediaShort[] = viewedStr ? JSON.parse(viewedStr) : [];

            const updatedViewed = [
                mediaData,
                ...viewed.filter(v => !(v.id === mediaData.id && v.type === mediaData.type))
            ].slice(0, MAX_VIEWED_ITEMS);

            localStorage.setItem(LOCAL_STORAGE_KEYS.viewed, JSON.stringify(updatedViewed));
        } catch (error) {
            console.error('Error updating viewed items:', error);
        }
    }, []);

    useEffect(() => {
        if (!id || !valid) return;

        const controller = new AbortController();

        (async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_APP_API}/${type}/${id}`, {
                    signal: controller.signal
                });
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);

                const result = await res.json();
                if (!result.success) return;

                setData(result.data);
                addViewed({
                    id: result.data.id,
                    poster: result.data.images.poster,
                    title: result.data.title,
                    type
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Error fetching media data:', error);
            }
        })();

        return () => controller.abort();
    }, [id, type, valid, addViewed]);

    useEffect(() => {
        if (!id || !valid || type !== 'series') {
            setEpisodesLoaded(type === 'movie');
            return;
        }

        const me = parseInt(search.get('me') ?? '', 10);
        if (Number.isInteger(me) && me > 0) {
            setMaxEpisodes(me);
            setEpisodesLoaded(true);
            return;
        }

        const controller = new AbortController();
        setEpisodesLoaded(false);

        (async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_APP_API}/episodes/${id}?s=${season}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);

                const result = await res.json();
                if (!result.success) {
                    nav('/');
                    return;
                }

                setMaxEpisodes(result.data.length);
                setEpisodesLoaded(true);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching episode data:', error);
                    nav('/');
                }
            }
        })();

        return () => controller.abort();
    }, [id, type, season, search, valid, nav]);

    /* ---------------------------------------------------------------- */
    /* Guards                                                            */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!id || !valid) nav('/', { replace: true });
    }, [id, valid, nav]);

    // Only bounce once we actually know the season/episode counts. Previously
    // maxEpisodes defaulted to 1, so /watch/x?s=1&e=5 kicked you home on load.
    useEffect(() => {
        if (type !== 'series' || !data || !('seasons' in data) || !episodesLoaded) return;
        if (season > data.seasons || episode > maxEpisodes) nav('/', { replace: true });
    }, [type, data, episodesLoaded, maxEpisodes, season, episode, nav]);

    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    /* ---------------------------------------------------------------- */
    /* Handlers                                                          */
    /* ---------------------------------------------------------------- */

    const handleDownload = useCallback(() => {
        const baseDownloadPage = type === 'movie'
            ? import.meta.env.VITE_MOIVE_DOWNLOAD_2
            : import.meta.env.VITE_MOIVE_DOWNLOAD_1;

        const url = type === 'movie'
            ? `${baseDownloadPage}?id=${id}`
            : `${baseDownloadPage}?id=${id}&s=${season}&e=${episode}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    }, [type, id, season, episode]);

    const handleBackClick = useCallback(() => {
        nav(`/${type}/${id}`);
    }, [nav, type, id]);

    const handleNextEpisode = useCallback(() => {
        const params = new URLSearchParams({
            s: String(season),
            e: String(episode + 1),
            me: String(maxEpisodes)
        });
        const src = search.get('src');
        if (src) params.set('src', src);

        nav(`/watch/${id}?${params.toString()}`);
    }, [nav, id, season, episode, maxEpisodes, search]);

    const preconnectUrl = useMemo(() => {
        try {
            return sourceUrl ? new URL(sourceUrl).origin : '';
        } catch {
            return '';
        }
    }, [sourceUrl]);

    if (!id || !valid) return null;

    return (
        <>
            <Helmet>
                <title>
                    {data?.title ? `${data.title} - ${import.meta.env.VITE_APP_NAME}` : import.meta.env.VITE_APP_NAME}
                </title>

                {preconnectUrl && (
                    <>
                        <link rel="preconnect" href={preconnectUrl} />
                        <link rel="dns-prefetch" href={preconnectUrl} />
                    </>
                )}
            </Helmet>

            <div className="player">
                <div className="player-controls">
                    <i
                        className="fa-regular fa-arrow-left"
                        onClick={handleBackClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleBackClick()}
                        aria-label="Go back"
                    />

                    <select value={source} onChange={handleSourceChange} aria-label="Select video source">
                        {SOURCES.map((s) => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                    </select>

                    <i
                        className="fa-solid fa-download"
                        onClick={handleDownload}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                        aria-label="Open download page"
                        style={{ cursor: 'pointer', marginLeft: '10px' }}
                    />

                    {type === 'series' && episodesLoaded && episode < maxEpisodes && (
                        <i
                            className="fa-regular fa-forward-step right"
                            onClick={handleNextEpisode}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleNextEpisode()}
                            aria-label="Next episode"
                        />
                    )}
                </div>

                {loading && !allSourcesFailed && (
                    <div className="loading-spinner" role="status" aria-label="Loading video">
                        <span className="sr-only">Loading...</span>
                    </div>
                )}

                {allSourcesFailed && (
                    <div className="player-error" role="alert">
                        No source could be loaded. Try picking one manually.
                    </div>
                )}

                {sourceUrl && !allSourcesFailed && (
                    <iframe
                        key={sourceUrl}
                        ref={iframeRef}
                        src={sourceUrl}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        title={`Video Player - ${data?.title || 'Movie'}`}
                        referrerPolicy="no-referrer"
                        loading="eager"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                )}
            </div>
        </>
    );
}
