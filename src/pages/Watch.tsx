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
const LOCAL_STORAGE_KEYS = {
    selectedSource: 'selectedSource',
    viewed: 'viewed'
} as const;

const SOURCES: Source[] = [
    { name: 'Vidsuper', url: 'https://vidsuper.net/' },
    { name: 'Peach', url: 'https://peachify.top/embed' },
    { name: 'Mist', url: 'https://play.xpass.top/e' },
    { name: '4K', url: 'https://player.videasy.net' },
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

const DEFAULT_SOURCE = SOURCES[0]?.name || 'Braflix';

const SPECIAL_SERIES_SOURCES = new Map([
    ['India', 'http://uembed.xyz']
]);

function constructMovieUrl(baseSource: string, source: string, id: string): string {
    const PRIMESRC_PARAMS = '&fallback=true&server_order=PrimeVid,Voe,Dood';

    switch (source) {
        case 'Simplify':
            return `${baseSource}/movie/${id}?autoplay=true&color=addc35&back=false&domainAd=braflix.win`;
        case 'Hindi':
            return `${baseSource}/movie/?id=${id}&s=undefined&e=undefined&poster=https://image.tmdb.org/t/p/w780/enNubozHn9pXi0ycTVYUWfpHZm.jpg&color=ffffff`;
        case '4K2':
            return `${baseSource}/movie/${id}`;
        case 'Prime':
            return `${baseSource}/${id}`;
        case '4KHD':
            return `${baseSource}/movie/${id}?autoPlay=true&theme=addc35`;
        case 'PrimeWire':
            return `${baseSource}/movie?imdb=${id}${PRIMESRC_PARAMS}`;
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
        case 'Spanish':
            return `${baseSource}/movie/${id}`;
        case 'Portuguese':
            return `${baseSource}/filme/${id}`;
        default:
            return `${baseSource}/movie/${id}`;
    }
}

function constructSeriesUrl(
    baseSource: string,
    source: string,
    id: string,
    season: number,
    episode: number,
    type: MediaType
): string {
    const PRIMESRC_PARAMS = '&third_party_fallback=true&server_order=PrimeVid,Voe,Dood';
    const isSpecialSource = SPECIAL_SERIES_SOURCES.get(source);
    let url: string;

    switch (source) {
        case 'Simplify':
            url = `${baseSource}/tv/${id}/${season}/${episode}?autoplay=true&color=addc35&back=false&domainAd=braflix.win`;
            break;
        case 'Hindi':
            return `${baseSource}/tv/?id=${id}&s=${season}&e=${episode}&next-ep=${episode + 1}&poster=https://image.tmdb.org/t/p/w780/yQw23xxmVBFVHPCF6V68TAIIfno.jpg&color=ffffff`;
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
        case 'Spanish':
            url = `${baseSource}/tv/${id}/${season}/${episode}`;
            break;
        case 'Portuguese':
            url = `${baseSource}/serie/${id}/${season}/${episode}`;
            break;
        case '4K':
            url = `${baseSource}/tv/${id}/${season}/${episode}`;
            url += url.includes('?') ? `&${SERIES_URL_PARAMS}` : `?${SERIES_URL_PARAMS}`;
            break;
        case 'Vidlink':
            url = `${baseSource}/tv/${id}/${season}/${episode}`;
            url += url.includes('?')
                ? '&primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true'
                : '?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true';
            break;
        default:
            if (isSpecialSource) {
                url = `${isSpecialSource}?id=${id}&s=${season}&e=${episode}`;
            } else {
                url = `${baseSource}/tv/${id}/${season}/${episode}`;
            }
            break;
    }

    if (source === 'Braflix' && type === 'series') {
        url += url.includes('?') ? '&autonext=1&ds_lang=en' : '?autonext=1&ds_lang=en';
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

    const [type, setType] = useState<MediaType>('movie');
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [maxEpisodes, setMaxEpisodes] = useState(1);
    const [data, setData] = useState<Movie | Series>();

    const [source, setSource] = useState(() => {
        const urlSource = search.get('src');
        if (urlSource && SOURCES.find(s => s.name === urlSource)) {
            return urlSource;
        }
        return getLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, DEFAULT_SOURCE);
    });

    const [loading, setLoading] = useState(true);
    const [hasErrored, setHasErrored] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const sourceUrl = useMemo(() => {
        if (!id) return '';

        const sourceData = SOURCES.find(s => s.name === source);
        if (!sourceData) return '';

        const { url: baseSource } = sourceData;

        if (type === 'movie') {
            return constructMovieUrl(baseSource, source, id);
        }

        return constructSeriesUrl(baseSource, source, id, season, episode, type);
    }, [source, type, id, season, episode]);

    const handleDownload = useCallback(() => {
        const baseDownloadPage = type === 'movie'
            ? import.meta.env.VITE_MOIVE_DOWNLOAD_2
            : import.meta.env.VITE_MOIVE_DOWNLOAD_1;

        const url = type === 'movie'
            ? `${baseDownloadPage}?id=${id}`
            : `${baseDownloadPage}?id=${id}&s=${season}&e=${episode}`;

        window.open(url, '_blank');
    }, [type, id, season, episode]);

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

    const fetchData = useCallback(async (mediaType: MediaType, signal: AbortSignal): Promise<void> => {
        if (!id) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API}/${mediaType}/${id}`, { signal });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const result = await response.json();
            if (!result.success) return;

            setData(result.data);
            addViewed({
                id: result.data.id,
                poster: result.data.images.poster,
                title: result.data.title,
                type: mediaType,
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching media data:', error);
            }
        }
    }, [id, addViewed]);

    const fetchMaxEpisodes = useCallback(async (seasonNumber: number, signal: AbortSignal): Promise<void> => {
        if (!id) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_APP_API}/episodes/${id}?s=${seasonNumber}`,
                { signal }
            );

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                nav('/');
                return;
            }
            setMaxEpisodes(result.data.length);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching episode data:', error);
                nav('/');
            }
        }
    }, [id, nav]);

    const handleIframeError = useCallback(() => {
        if (!hasErrored) {
            const currentIdx = SOURCES.findIndex(s => s.name === source);
            const nextSource = SOURCES[currentIdx + 1]?.name || SOURCES[0].name;
            console.warn(`${source} source failed to load, falling back to ${nextSource}`);

            setHasErrored(true);
            setSource(nextSource);
            setLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, nextSource);
        }
        setLoading(false);
    }, [source, hasErrored]);

    useEffect(() => {
        if (!hasErrored) {
            setLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, source);
        }
    }, [source, hasErrored]);

    useEffect(() => {
        if (!data || !('seasons' in data)) return;
        if (season > data.seasons || episode > maxEpisodes) {
            nav('/');
        }
    }, [data, maxEpisodes, season, episode, nav]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const s = search.get('s');
        const e = search.get('e');
        const me = search.get('me');

        if (!s || !e) {
            setType('movie');
            fetchData('movie', signal);
            return () => controller.abort();
        }

        const seasonNum = parseInt(s, 10);
        const episodeNum = parseInt(e, 10);

        if (isNaN(seasonNum) || isNaN(episodeNum) || seasonNum < 1 || episodeNum < 1) {
            nav('/');
            return () => controller.abort();
        }

        setSeason(seasonNum);
        setEpisode(episodeNum);
        setType('series');
        fetchData('series', signal);

        if (me) {
            const maxEps = parseInt(me, 10);
            if (!isNaN(maxEps) && maxEps > 0) {
                setMaxEpisodes(maxEps);
            } else {
                fetchMaxEpisodes(seasonNum, signal);
            }
        } else {
            fetchMaxEpisodes(seasonNum, signal);
        }

        return () => controller.abort();
    }, [id, search, fetchData, fetchMaxEpisodes, nav]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        if (!sourceUrl) return;

        setLoading(true);

        const timeoutDuration = 8000;
        const timer = setTimeout(() => {
            if (!hasErrored) {
                const currentIdx = SOURCES.findIndex(s => s.name === source);
                const nextSource = SOURCES[currentIdx + 1]?.name || SOURCES[0].name;
                console.warn(`${source} source timed out, falling back to ${nextSource}`);

                setHasErrored(true);
                setSource(nextSource);
                setLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, nextSource);
            } else {
                setLoading(false);
            }
        }, timeoutDuration);

        const handleIframeLoad = () => {
            clearTimeout(timer);
            setLoading(false);
            setHasErrored(false);
        };

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
            iframe.addEventListener('error', handleIframeError);
        }

        return () => {
            clearTimeout(timer);
            if (iframe) {
                iframe.removeEventListener('load', handleIframeLoad);
                iframe.removeEventListener('error', handleIframeError);
            }
        };

    }, [sourceUrl, source, hasErrored, handleIframeError]);

    useEffect(() => {
        setHasErrored(false);
    }, [source]);

    useEffect(() => {
        const urlSource = search.get('src');
        if (urlSource && SOURCES.find(s => s.name === urlSource)) {
            setSource(urlSource);
            setHasErrored(false);
        }
    }, [search]);

    const handleBackClick = useCallback(() => {
        nav(`/${type}/${id}`);
    }, [nav, type, id]);

    const handleNextEpisode = useCallback(() => {
        nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`);
    }, [nav, id, season, episode, maxEpisodes]);

    const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSource = e.target.value;
        setSource(newSource);
        setHasErrored(false);
        setLocalStorageValue(LOCAL_STORAGE_KEYS.selectedSource, newSource);
    }, []);

    const preconnectUrl = useMemo(() => {
        try {
            return sourceUrl ? new URL(sourceUrl).origin : '';
        } catch {
            return '';
        }
    }, [sourceUrl]);

    if (!id) {
        nav('/');
        return null;
    }

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

                    <select
                        value={source}
                        onChange={handleSourceChange}
                        aria-label="Select video source"
                    >
                        {SOURCES.map((s) => (
                            <option key={s.name} value={s.name}>
                                {s.name}
                            </option>
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

                    {type === 'series' && episode < maxEpisodes && (
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
                {loading && (
                    <div className="loading-spinner" role="status" aria-label="Loading video">
                        <span className="sr-only">Loading...</span>
                    </div>
                )}
                {sourceUrl && (
                    <iframe
                        ref={iframeRef}
                        src={sourceUrl}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        title={`Video Player - ${data?.title || 'Movie'}`}
                        referrerPolicy="origin"
                        loading="eager"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                )}
            </div>
        </>
    );
}
