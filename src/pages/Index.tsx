import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';

interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  size: string;
  url: string;
  file?: File;
  duration?: number;
}

interface OverlayElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  startTime: number;
  endTime: number;
}

interface TimelineClip {
  id: string;
  mediaId: string;
  startTime: number;
  endTime: number;
  trimStart: number;
  trimEnd: number;
  track: 'video' | 'audio';
  volume: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    filter: FilterType;
  };
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'projects' | 'library'>('home');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [volume, setVolume] = useState([100]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [overlayElements, setOverlayElements] = useState<OverlayElement[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textToAdd, setTextToAdd] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState([32]);
  const [ttsText, setTtsText] = useState('');
  const [ttsLanguage, setTtsLanguage] = useState('ru-RU');
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const filters = [
    { id: 'none', name: 'Оригинал', icon: 'Image' },
    { id: 'grayscale', name: 'Ч/Б', icon: 'Contrast' },
    { id: 'sepia', name: 'Сепия', icon: 'Sun' },
    { id: 'blur', name: 'Размытие', icon: 'Droplet' },
    { id: 'brightness', name: 'Яркость', icon: 'Lightbulb' },
    { id: 'contrast', name: 'Контраст', icon: 'Settings' },
  ];

  const languages = [
    { code: 'ru-RU', name: 'Русский' },
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'zh-CN', name: '中文' },
    { code: 'ja-JP', name: '日本語' },
  ];

  useEffect(() => {
    if (videoRef.current && selectedClip) {
      const clip = timelineClips.find(c => c.id === selectedClip);
      if (clip) applyFilters(clip.filters);
    }
  }, [selectedClip, brightness, contrast, saturation, selectedFilter]);

  const applyFilters = (filterSettings: TimelineClip['filters']) => {
    if (!videoRef.current) return;
    const filters = [];
    if (filterSettings.filter === 'grayscale') filters.push('grayscale(100%)');
    if (filterSettings.filter === 'sepia') filters.push('sepia(100%)');
    if (filterSettings.filter === 'blur') filters.push('blur(5px)');
    filters.push(`brightness(${filterSettings.brightness}%)`);
    filters.push(`contrast(${filterSettings.contrast}%)`);
    filters.push(`saturate(${filterSettings.saturation}%)`);
    videoRef.current.style.filter = filters.join(' ');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const fileType = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: fileType,
        size: `${(file.size / 1024 / 1024).toFixed(2)} МБ`,
        url,
        file,
      };
      if (fileType === 'video' || fileType === 'audio') {
        const media = document.createElement(fileType);
        media.src = url;
        media.onloadedmetadata = () => {
          newFile.duration = media.duration;
          setMediaFiles(prev => [...prev, newFile]);
        };
      } else {
        setMediaFiles(prev => [...prev, newFile]);
      }
    });
    toast({ title: "Файлы загружены", description: `Добавлено: ${files.length}` });
  };

  const addToTimeline = (media: MediaFile) => {
    const lastClip = timelineClips[timelineClips.length - 1];
    const startTime = lastClip ? lastClip.endTime : 0;
    const clipDuration = media.duration || 5;
    const newClip: TimelineClip = {
      id: Date.now().toString() + Math.random(),
      mediaId: media.id,
      startTime,
      endTime: startTime + clipDuration,
      trimStart: 0,
      trimEnd: clipDuration,
      track: media.type === 'audio' ? 'audio' : 'video',
      volume: 100,
      filters: { brightness: 100, contrast: 100, saturation: 100, filter: 'none' },
    };
    setTimelineClips(prev => [...prev, newClip]);
    setDuration(Math.max(duration, newClip.endTime));
    setSelectedClip(newClip.id);
    
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.src = media.url;
      videoRef.current.load();
    }
    
    toast({ title: "Добавлено на таймлайн", description: media.name });
  };

  const addTextOverlay = () => {
    if (!textToAdd.trim()) return;
    const newOverlay: OverlayElement = {
      id: Date.now().toString() + Math.random(),
      type: 'text',
      content: textToAdd,
      x: 50,
      y: 50,
      width: 300,
      height: 100,
      fontSize: fontSize[0],
      color: textColor,
      startTime: currentTime,
      endTime: currentTime + 5,
    };
    setOverlayElements(prev => [...prev, newOverlay]);
    setTextToAdd('');
    toast({ title: "Текст добавлен" });
  };

  const addImageOverlay = (media: MediaFile) => {
    const newOverlay: OverlayElement = {
      id: Date.now().toString() + Math.random(),
      type: 'image',
      content: media.url,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      startTime: currentTime,
      endTime: currentTime + 5,
    };
    setOverlayElements(prev => [...prev, newOverlay]);
    toast({ title: "Изображение добавлено" });
  };

  const handleOverlayMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.stopPropagation();
    const overlay = overlayElements.find(o => o.id === overlayId);
    if (!overlay) return;
    setSelectedOverlay(overlayId);
    setIsDragging(true);
    setDragOffset({ x: e.clientX - overlay.x, y: e.clientY - overlay.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedOverlay || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 50));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 50));
    setOverlayElements(prev => prev.map(overlay => overlay.id === selectedOverlay ? { ...overlay, x, y } : overlay));
  };

  const resizeOverlay = (overlayId: string, scale: number) => {
    setOverlayElements(prev => prev.map(overlay => overlay.id === overlayId ? {
      ...overlay,
      width: overlay.width * scale,
      height: overlay.height * scale,
    } : overlay));
  };

  const deleteOverlay = (overlayId: string) => {
    setOverlayElements(prev => prev.filter(o => o.id !== overlayId));
    setSelectedOverlay(null);
    toast({ title: "Элемент удалён" });
  };

  const textToSpeech = () => {
    if (!ttsText.trim()) return;
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = ttsLanguage;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => toast({ title: "Озвучка завершена" });
    speechSynthesis.speak(utterance);
    toast({ title: "Озвучка начата", description: languages.find(l => l.code === ttsLanguage)?.name });
  };

  const exportVideo = () => {
    if (timelineClips.length === 0) {
      toast({ title: "Ошибка", description: "Добавьте клипы на таймлайн", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    toast({ title: "Экспорт начат" });
    setTimeout(() => {
      setIsExporting(false);
      toast({ title: "Видео готово!", description: "Проект экспортирован" });
    }, 3000);
  };

  const deleteClip = (clipId: string) => {
    setTimelineClips(prev => prev.filter(c => c.id !== clipId));
    if (selectedClip === clipId) setSelectedClip(null);
    toast({ title: "Клип удалён" });
  };

  const splitClip = (clipId: string) => {
    const clip = timelineClips.find(c => c.id === clipId);
    if (!clip) return;
    const splitPoint = clip.startTime + (clip.endTime - clip.startTime) / 2;
    const clip1: TimelineClip = { ...clip, id: Date.now().toString() + Math.random(), endTime: splitPoint, trimEnd: clip.trimStart + (splitPoint - clip.startTime) };
    const clip2: TimelineClip = { ...clip, id: Date.now().toString() + Math.random() + 1, startTime: splitPoint, trimStart: clip1.trimEnd };
    setTimelineClips(prev => {
      const index = prev.findIndex(c => c.id === clipId);
      const newClips = [...prev];
      newClips.splice(index, 1, clip1, clip2);
      return newClips;
    });
    toast({ title: "Клип разделён" });
  };

  const updateClipFilters = (clipId: string) => {
    setTimelineClips(prev => prev.map(clip => clip.id === clipId ? {
      ...clip,
      filters: { brightness: brightness[0], contrast: contrast[0], saturation: saturation[0], filter: selectedFilter },
      volume: volume[0],
    } : clip));
    toast({ title: "Эффекты применены" });
  };

  const playTimeline = () => {
    if (!videoRef.current || timelineClips.length === 0) return;
    const videoClips = timelineClips.filter(c => c.track === 'video');
    if (videoClips.length > 0) {
      const firstClip = videoClips[0];
      const media = mediaFiles.find(m => m.id === firstClip.mediaId);
      if (media && videoRef.current) {
        videoRef.current.src = media.url;
        videoRef.current.currentTime = firstClip.trimStart;
        videoRef.current.play();
        setIsPlaying(true);
        applyFilters(firstClip.filters);
      }
    }
  };

  const pauseTimeline = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopTimeline = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHome = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Видеоредактор Pro
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Профессиональный инструмент для создания и редактирования видео
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setCurrentView('editor')} className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
            <Icon name="Plus" size={20} className="mr-2" />
            Новый проект
          </Button>
          <Button onClick={() => setCurrentView('projects')} variant="outline" className="px-8 py-6 text-lg">
            <Icon name="FolderOpen" size={20} className="mr-2" />
            Открыть проект
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <input ref={fileInputRef} type="file" multiple accept="video/*,audio/*,image/*" onChange={handleFileUpload} className="hidden" />
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-4 p-4 overflow-hidden">
        <Card className="bg-card p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Layers" size={18} />
              Медиа
            </h3>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} className="bg-primary h-7 w-7 p-0">
              <Icon name="Plus" size={14} />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {mediaFiles.map((file) => (
                <div key={file.id} className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer group relative" draggable onDragStart={(e) => e.dataTransfer.setData('mediaId', file.id)}>
                  <div className="flex items-center gap-3">
                    <Icon name={file.type === 'video' ? 'Video' : file.type === 'audio' ? 'Music' : 'Image'} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addToTimeline(file)} className="h-6 w-6 p-0">
                      <Icon name="Plus" size={12} />
                    </Button>
                    {file.type === 'image' && (
                      <Button size="sm" variant="ghost" onClick={() => addImageOverlay(file)} className="h-6 w-6 p-0">
                        <Icon name="Image" size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {mediaFiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="FileVideo" size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Загрузите файлы</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 bg-card p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Превью</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => stopTimeline()} className="h-8 w-8 p-0">
                  <Icon name="SkipBack" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => isPlaying ? pauseTimeline() : playTimeline()} className="h-8 w-8 p-0">
                  <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
                </Button>
              </div>
            </div>
            <div ref={previewRef} className="flex-1 flex items-center justify-center bg-black rounded-lg relative overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)}>
              {timelineClips.length > 0 ? (
                <>
                  <video ref={videoRef} className="max-w-full max-h-full" controls onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(Math.max(duration, e.currentTarget.duration))} />
                  {overlayElements.filter(o => currentTime >= o.startTime && currentTime <= o.endTime).map((overlay) => (
                    <div key={overlay.id} className={`absolute cursor-move ${selectedOverlay === overlay.id ? 'ring-2 ring-primary' : ''}`}
                      style={{ left: overlay.x, top: overlay.y, width: overlay.width, height: overlay.height }}
                      onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}>
                      {overlay.type === 'text' ? (
                        <div className="w-full h-full flex items-center justify-center" style={{ fontSize: overlay.fontSize, color: overlay.color, textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {overlay.content}
                        </div>
                      ) : (
                        <img src={overlay.content} alt="" className="w-full h-full object-contain" />
                      )}
                      {selectedOverlay === overlay.id && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-background/90 rounded p-1">
                          <Button size="sm" variant="ghost" onClick={() => resizeOverlay(overlay.id, 1.1)} className="h-6 w-6 p-0">
                            <Icon name="ZoomIn" size={12} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => resizeOverlay(overlay.id, 0.9)} className="h-6 w-6 p-0">
                            <Icon name="ZoomOut" size={12} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteOverlay(overlay.id)} className="h-6 w-6 p-0">
                            <Icon name="Trash2" size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center">
                  <Icon name="Play" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Добавьте видео</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-card p-4 h-[280px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Film" size={18} />
                Таймлайн
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Clock" size={14} />
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="relative bg-secondary/30 rounded-lg p-3 min-h-[220px]" onDrop={(e) => { e.preventDefault(); const mediaId = e.dataTransfer.getData('mediaId'); const media = mediaFiles.find(m => m.id === mediaId); if (media) addToTimeline(media); }} onDragOver={(e) => e.preventDefault()}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon name="Video" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Видео</span>
                </div>
                <div className="flex gap-2 mb-4 min-h-[60px] flex-wrap">
                  {timelineClips.filter(c => c.track === 'video').map((clip) => {
                    const media = mediaFiles.find(m => m.id === clip.mediaId);
                    const widthPercent = duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 20;
                    return (
                      <div key={clip.id} className={`relative rounded border-2 cursor-pointer transition-all hover:scale-105 ${selectedClip === clip.id ? 'border-primary bg-primary/20 shadow-lg' : 'border-border bg-gradient-to-br from-purple-500/30 to-blue-500/20'}`}
                        style={{ minWidth: `${Math.max(widthPercent, 12)}%`, height: '56px' }}
                        onClick={() => setSelectedClip(clip.id)}>
                        <div className="p-2 h-full flex flex-col justify-between">
                          <p className="text-xs font-medium truncate">{media?.name}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(clip.endTime - clip.startTime)}</p>
                        </div>
                        {selectedClip === clip.id && (
                          <div className="absolute -top-9 right-0 flex gap-1 bg-background/95 p-1 rounded shadow-lg">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); splitClip(clip.id); }} className="h-6 w-6 p-0">
                              <Icon name="Scissors" size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteClip(clip.id); }} className="h-6 w-6 p-0">
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <Icon name="Music" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Аудио</span>
                </div>
                <div className="flex gap-2 min-h-[48px] flex-wrap">
                  {timelineClips.filter(c => c.track === 'audio').map((clip) => {
                    const widthPercent = duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 20;
                    return (
                      <div key={clip.id} className={`relative rounded border-2 cursor-pointer transition-all ${selectedClip === clip.id ? 'border-primary bg-primary/20' : 'border-border bg-gradient-to-br from-blue-500/30 to-cyan-500/20'}`}
                        style={{ minWidth: `${Math.max(widthPercent, 12)}%`, height: '44px' }}
                        onClick={() => setSelectedClip(clip.id)}>
                        <div className="p-2 h-full flex items-center justify-between">
                          <Icon name="Music" size={14} />
                          <p className="text-xs text-muted-foreground">{formatTime(clip.endTime - clip.startTime)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {duration > 0 && (
                  <div className="absolute top-3 w-0.5 bg-primary h-[calc(100%-24px)] pointer-events-none" style={{ left: `${(currentTime / duration) * 100}%` }} />
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <Card className="bg-card p-4 flex flex-col overflow-hidden">
          <Tabs defaultValue="effects" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="effects" className="text-xs">Эффекты</TabsTrigger>
              <TabsTrigger value="text" className="text-xs">Текст</TabsTrigger>
              <TabsTrigger value="tts" className="text-xs">Озвучка</TabsTrigger>
              <TabsTrigger value="edit" className="text-xs">Монтаж</TabsTrigger>
            </TabsList>

            <TabsContent value="effects" className="flex-1 overflow-y-auto space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Фильтры</label>
                <div className="grid grid-cols-2 gap-2">
                  {filters.map((filter) => (
                    <button key={filter.id} onClick={() => setSelectedFilter(filter.id as FilterType)}
                      className={`p-2 rounded-lg flex items-center gap-2 ${selectedFilter === filter.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}>
                      <Icon name={filter.icon as any} size={16} />
                      <span className="text-xs font-medium">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Яркость</label>
                  <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
                </div>
                <Slider value={brightness} onValueChange={setBrightness} max={200} step={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Контраст</label>
                  <span className="text-sm text-muted-foreground">{contrast[0]}%</span>
                </div>
                <Slider value={contrast} onValueChange={setContrast} max={200} step={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Насыщенность</label>
                  <span className="text-sm text-muted-foreground">{saturation[0]}%</span>
                </div>
                <Slider value={saturation} onValueChange={setSaturation} max={200} step={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Громкость</label>
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={200} step={1} />
              </div>
              {selectedClip && (
                <Button onClick={() => updateClipFilters(selectedClip)} className="w-full bg-primary">
                  <Icon name="Check" size={18} className="mr-2" />
                  Применить
                </Button>
              )}
            </TabsContent>

            <TabsContent value="text" className="flex-1 overflow-y-auto space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Текст</label>
                <Textarea placeholder="Введите текст..." value={textToAdd} onChange={(e) => setTextToAdd(e.target.value)} className="min-h-[80px]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Размер</label>
                <Slider value={fontSize} onValueChange={setFontSize} min={12} max={120} step={1} />
                <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Цвет</label>
                <div className="flex gap-2">
                  <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-16 h-10" />
                  <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <Button onClick={addTextOverlay} className="w-full bg-primary" disabled={!textToAdd.trim()}>
                <Icon name="Type" size={18} className="mr-2" />
                Добавить текст
              </Button>
              {overlayElements.length > 0 && (
                <div className="pt-3 border-t">
                  <label className="text-sm font-medium mb-2 block">Слои ({overlayElements.length})</label>
                  <ScrollArea className="h-32">
                    {overlayElements.map((overlay) => (
                      <div key={overlay.id} className={`p-2 mb-1 rounded cursor-pointer ${selectedOverlay === overlay.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                        onClick={() => setSelectedOverlay(overlay.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon name={overlay.type === 'text' ? 'Type' : 'Image'} size={14} />
                            <span className="text-xs truncate">{overlay.type === 'text' ? overlay.content : 'Изображение'}</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteOverlay(overlay.id); }} className="h-6 w-6 p-0">
                            <Icon name="X" size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tts" className="flex-1 overflow-y-auto space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Текст для озвучки</label>
                <Textarea placeholder="Введите текст..." value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="min-h-[100px]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Язык</label>
                <Select value={ttsLanguage} onValueChange={setTtsLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={textToSpeech} className="w-full bg-primary" disabled={!ttsText.trim()}>
                <Icon name="Volume2" size={18} className="mr-2" />
                Озвучить
              </Button>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">💡 Озвучка воспроизводится сразу</p>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="flex-1 overflow-y-auto space-y-3">
              {selectedClip ? (
                <>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-1">Выбранный клип</p>
                    <p className="text-xs text-muted-foreground">{mediaFiles.find(m => m.id === timelineClips.find(c => c.id === selectedClip)?.mediaId)?.name}</p>
                  </div>
                  <Button onClick={() => splitClip(selectedClip)} className="w-full" variant="outline">
                    <Icon name="Scissors" size={18} className="mr-2" />
                    Разделить клип
                  </Button>
                  <Button onClick={() => deleteClip(selectedClip)} className="w-full" variant="destructive">
                    <Icon name="Trash2" size={18} className="mr-2" />
                    Удалить клип
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Выберите клип на таймлайне</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Icon name="Film" size={24} className="text-primary" />
              VideoEdit Pro
            </h1>
            <nav className="flex gap-1">
              <Button variant={currentView === 'home' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('home')} className="gap-2">
                <Icon name="Home" size={18} />
                Главная
              </Button>
              <Button variant={currentView === 'editor' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('editor')} className="gap-2">
                <Icon name="Scissors" size={18} />
                Редактор
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Settings" size={18} />
            </Button>
            <Button className="bg-primary gap-2" onClick={exportVideo} disabled={isExporting}>
              <Icon name={isExporting ? "Loader2" : "Download"} size={18} className={isExporting ? "animate-spin" : ""} />
              {isExporting ? "Экспорт..." : "Экспорт"}
            </Button>
          </div>
        </div>
      </header>
      {currentView === 'home' && renderHome()}
      {currentView === 'editor' && renderEditor()}
    </div>
  );
};

export default Index;