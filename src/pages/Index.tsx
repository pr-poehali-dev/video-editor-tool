import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';
type TransitionType = 'none' | 'fade' | 'slide' | 'zoom';

interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  size: string;
  url: string;
  file?: File;
  duration?: number;
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
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('none');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [volume, setVolume] = useState([100]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const projects = [
    { id: 1, name: 'Рекламный ролик', duration: '0:45', modified: '2 часа назад' },
    { id: 2, name: 'Презентация продукта', duration: '1:30', modified: 'Вчера' },
    { id: 3, name: 'Обучающее видео', duration: '5:20', modified: '3 дня назад' },
  ];

  const filters = [
    { id: 'none', name: 'Оригинал', icon: 'Image' },
    { id: 'grayscale', name: 'Ч/Б', icon: 'Contrast' },
    { id: 'sepia', name: 'Сепия', icon: 'Sun' },
    { id: 'blur', name: 'Размытие', icon: 'Droplet' },
    { id: 'brightness', name: 'Яркость', icon: 'Lightbulb' },
    { id: 'contrast', name: 'Контраст', icon: 'Settings' },
  ];

  const transitions = [
    { id: 'none', name: 'Без перехода', icon: 'Square' },
    { id: 'fade', name: 'Затухание', icon: 'Circle' },
    { id: 'slide', name: 'Сдвиг', icon: 'MoveRight' },
    { id: 'zoom', name: 'Масштаб', icon: 'ZoomIn' },
  ];

  useEffect(() => {
    if (videoRef.current && selectedClip) {
      const clip = timelineClips.find(c => c.id === selectedClip);
      if (clip) {
        applyFilters(clip.filters);
      }
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
      const fileType = file.type.startsWith('video') ? 'video' : 
                       file.type.startsWith('audio') ? 'audio' : 'image';
      
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

    toast({
      title: "Файлы загружены",
      description: `Добавлено файлов: ${files.length}`,
    });
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
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        filter: 'none',
      },
    };

    setTimelineClips(prev => [...prev, newClip]);
    setDuration(newClip.endTime);
    
    toast({
      title: "Добавлено на таймлайн",
      description: media.name,
    });
  };

  const deleteClip = (clipId: string) => {
    setTimelineClips(prev => prev.filter(c => c.id !== clipId));
    if (selectedClip === clipId) {
      setSelectedClip(null);
    }
    toast({
      title: "Клип удалён",
      description: "Фрагмент удалён с таймлайна",
    });
  };

  const splitClip = (clipId: string) => {
    const clip = timelineClips.find(c => c.id === clipId);
    if (!clip) return;

    const splitPoint = clip.startTime + (clip.endTime - clip.startTime) / 2;
    const clip1: TimelineClip = {
      ...clip,
      id: Date.now().toString() + Math.random(),
      endTime: splitPoint,
      trimEnd: clip.trimStart + (splitPoint - clip.startTime),
    };

    const clip2: TimelineClip = {
      ...clip,
      id: Date.now().toString() + Math.random() + 1,
      startTime: splitPoint,
      trimStart: clip1.trimEnd,
    };

    setTimelineClips(prev => {
      const index = prev.findIndex(c => c.id === clipId);
      const newClips = [...prev];
      newClips.splice(index, 1, clip1, clip2);
      return newClips;
    });

    toast({
      title: "Клип разделён",
      description: "Фрагмент разделён на две части",
    });
  };

  const trimClipStart = (clipId: string, seconds: number) => {
    setTimelineClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        const newTrimStart = Math.max(0, clip.trimStart + seconds);
        const newStartTime = clip.startTime + seconds;
        return {
          ...clip,
          trimStart: newTrimStart,
          startTime: newStartTime,
        };
      }
      return clip;
    }));
  };

  const trimClipEnd = (clipId: string, seconds: number) => {
    setTimelineClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        const newTrimEnd = Math.max(clip.trimStart + 0.1, clip.trimEnd - seconds);
        const newEndTime = clip.endTime - seconds;
        return {
          ...clip,
          trimEnd: newTrimEnd,
          endTime: newEndTime,
        };
      }
      return clip;
    }));
  };

  const updateClipFilters = (clipId: string) => {
    setTimelineClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          filters: {
            brightness: brightness[0],
            contrast: contrast[0],
            saturation: saturation[0],
            filter: selectedFilter,
          },
          volume: volume[0],
        };
      }
      return clip;
    }));
    
    toast({
      title: "Эффекты применены",
      description: "Настройки сохранены для клипа",
    });
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
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Видеоредактор
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Профессиональный инструмент для создания и редактирования видео
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setCurrentView('editor')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Новый проект
          </Button>
          <Button
            onClick={() => setCurrentView('projects')}
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            <Icon name="FolderOpen" size={20} className="mr-2" />
            Открыть проект
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex-1 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="flex-1 grid grid-cols-[300px_1fr_300px] gap-4 p-4">
        <Card className="bg-card border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Layers" size={18} />
              Медиафайлы
            </h3>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90"
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors group"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('mediaId', file.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={file.type === 'video' ? 'Video' : file.type === 'audio' ? 'Music' : 'Image'}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToTimeline(file)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="Plus" size={14} />
                    </Button>
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

        <div className="flex flex-col gap-4">
          <Card className="flex-1 bg-card border-border p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Превью</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => stopTimeline()}>
                    <Icon name="SkipBack" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => isPlaying ? pauseTimeline() : playTimeline()}>
                    <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg relative overflow-hidden">
                {timelineClips.length > 0 ? (
                  <video
                    ref={videoRef}
                    className="max-w-full max-h-full rounded"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  />
                ) : (
                  <div className="text-center">
                    <Icon name="Play" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Добавьте видео на таймлайн</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4 h-[250px]">
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
            <ScrollArea className="h-[180px]">
              <div
                className="relative bg-secondary/30 rounded-lg p-3 min-h-[140px]"
                onDrop={(e) => {
                  e.preventDefault();
                  const mediaId = e.dataTransfer.getData('mediaId');
                  const media = mediaFiles.find(m => m.id === mediaId);
                  if (media) addToTimeline(media);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="mb-2 text-xs text-muted-foreground">Видео дорожка</div>
                <div className="flex gap-2 mb-4">
                  {timelineClips.filter(c => c.track === 'video').map((clip) => {
                    const media = mediaFiles.find(m => m.id === clip.mediaId);
                    const width = ((clip.endTime - clip.startTime) / duration) * 100;
                    return (
                      <div
                        key={clip.id}
                        className={`relative h-16 rounded border-2 cursor-pointer transition-colors ${
                          selectedClip === clip.id ? 'border-primary bg-primary/20' : 'border-border bg-purple-500/20'
                        }`}
                        style={{ minWidth: `${Math.max(width, 10)}%` }}
                        onClick={() => setSelectedClip(clip.id)}
                      >
                        <div className="p-2 h-full flex flex-col justify-between">
                          <p className="text-xs font-medium truncate">{media?.name}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(clip.endTime - clip.startTime)}</p>
                        </div>
                        {selectedClip === clip.id && (
                          <div className="absolute -top-8 right-0 flex gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); splitClip(clip.id); }}>
                              <Icon name="Scissors" size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteClip(clip.id); }}>
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mb-2 text-xs text-muted-foreground">Аудио дорожка</div>
                <div className="flex gap-2">
                  {timelineClips.filter(c => c.track === 'audio').map((clip) => {
                    const media = mediaFiles.find(m => m.id === clip.mediaId);
                    const width = ((clip.endTime - clip.startTime) / duration) * 100;
                    return (
                      <div
                        key={clip.id}
                        className={`relative h-12 rounded border-2 cursor-pointer transition-colors ${
                          selectedClip === clip.id ? 'border-primary bg-primary/20' : 'border-border bg-blue-500/20'
                        }`}
                        style={{ minWidth: `${Math.max(width, 10)}%` }}
                        onClick={() => setSelectedClip(clip.id)}
                      >
                        <div className="p-2 h-full flex items-center justify-between">
                          <Icon name="Music" size={14} />
                          <p className="text-xs text-muted-foreground">{formatTime(clip.endTime - clip.startTime)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>

        <Card className="bg-card border-border p-4">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="filters">Фильтры</TabsTrigger>
              <TabsTrigger value="color">Цвет</TabsTrigger>
              <TabsTrigger value="edit">Монтаж</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-2">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id as FilterType)}
                    className={`w-full p-3 rounded-lg text-left transition-colors mb-2 flex items-center gap-3 ${
                      selectedFilter === filter.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <Icon name={filter.icon as any} size={18} />
                    <span className="text-sm font-medium">{filter.name}</span>
                  </button>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="color" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Яркость</label>
                  <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
                </div>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Контраст</label>
                  <span className="text-sm text-muted-foreground">{contrast[0]}%</span>
                </div>
                <Slider
                  value={contrast}
                  onValueChange={setContrast}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Насыщенность</label>
                  <span className="text-sm text-muted-foreground">{saturation[0]}%</span>
                </div>
                <Slider
                  value={saturation}
                  onValueChange={setSaturation}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Громкость</label>
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {selectedClip && (
                <Button
                  onClick={() => updateClipFilters(selectedClip)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Применить эффекты
                </Button>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-3">
              {selectedClip ? (
                <>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-2">Выбранный клип</p>
                    <p className="text-xs text-muted-foreground">
                      {mediaFiles.find(m => m.id === timelineClips.find(c => c.id === selectedClip)?.mediaId)?.name}
                    </p>
                  </div>

                  <Button
                    onClick={() => splitClip(selectedClip)}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="Scissors" size={18} className="mr-2" />
                    Разделить клип
                  </Button>

                  <Button
                    onClick={() => trimClipStart(selectedClip, 0.5)}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="ChevronRight" size={18} className="mr-2" />
                    Обрезать начало (0.5с)
                  </Button>

                  <Button
                    onClick={() => trimClipEnd(selectedClip, 0.5)}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="ChevronLeft" size={18} className="mr-2" />
                    Обрезать конец (0.5с)
                  </Button>

                  <Button
                    onClick={() => deleteClip(selectedClip)}
                    className="w-full"
                    variant="destructive"
                  >
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

  const renderProjects = () => (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Мои проекты</h2>
          <Button onClick={() => setCurrentView('editor')} className="bg-primary hover:bg-primary/90">
            <Icon name="Plus" size={18} className="mr-2" />
            Новый проект
          </Button>
        </div>
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 bg-card border-border hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => setCurrentView('editor')}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                  <Icon name="Video" size={32} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{project.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      {project.duration}
                    </span>
                    <span>{project.modified}</span>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Библиотека медиафайлов</h2>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="Upload" size={18} className="mr-2" />
            Загрузить файл
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <Card
              key={file.id}
              className="p-4 bg-card border-border hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center mb-3">
                <Icon
                  name={file.type === 'video' ? 'Video' : file.type === 'audio' ? 'Music' : 'Image'}
                  size={32}
                  className="text-muted-foreground"
                />
              </div>
              <p className="text-sm font-medium truncate mb-1">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </Card>
          ))}
          {mediaFiles.length === 0 && (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              <Icon name="FileVideo" size={64} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">Библиотека пуста</p>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Загрузить первый файл
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Icon name="Film" size={24} className="text-primary" />
              VideoEdit
            </h1>
            <nav className="flex gap-1">
              <Button
                variant={currentView === 'home' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentView('home')}
                className="gap-2"
              >
                <Icon name="Home" size={18} />
                Главная
              </Button>
              <Button
                variant={currentView === 'editor' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentView('editor')}
                className="gap-2"
              >
                <Icon name="Scissors" size={18} />
                Редактор
              </Button>
              <Button
                variant={currentView === 'projects' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentView('projects')}
                className="gap-2"
              >
                <Icon name="FolderOpen" size={18} />
                Проекты
              </Button>
              <Button
                variant={currentView === 'library' ? 'secondary' : 'ghost'}
                onClick={() => setCurrentView('library')}
                className="gap-2"
              >
                <Icon name="Database" size={18} />
                Библиотека
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
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Icon name="Download" size={18} />
              Экспорт
            </Button>
          </div>
        </div>
      </header>

      {currentView === 'home' && renderHome()}
      {currentView === 'editor' && renderEditor()}
      {currentView === 'projects' && renderProjects()}
      {currentView === 'library' && renderLibrary()}
    </div>
  );
};

export default Index;
