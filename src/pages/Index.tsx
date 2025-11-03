import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';
type TransitionType = 'none' | 'fade' | 'slide' | 'zoom';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'projects' | 'library'>('home');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('none');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);

  const projects = [
    { id: 1, name: 'Рекламный ролик', duration: '0:45', modified: '2 часа назад' },
    { id: 2, name: 'Презентация продукта', duration: '1:30', modified: 'Вчера' },
    { id: 3, name: 'Обучающее видео', duration: '5:20', modified: '3 дня назад' },
  ];

  const mediaFiles = [
    { id: 1, name: 'intro.mp4', type: 'video', size: '45 МБ' },
    { id: 2, name: 'logo.png', type: 'image', size: '2 МБ' },
    { id: 3, name: 'music.mp3', type: 'audio', size: '8 МБ' },
    { id: 4, name: 'outro.mp4', type: 'video', size: '32 МБ' },
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
      <div className="flex-1 grid grid-cols-[300px_1fr_300px] gap-4 p-4">
        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Icon name="Layers" size={18} />
            Медиафайлы
          </h3>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
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
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 bg-card border-border p-4">
            <div className="h-full flex items-center justify-center bg-secondary/30 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
              <div className="relative text-center">
                <Icon name="Play" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Превью видео</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4 h-[200px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Film" size={18} />
                Таймлайн
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Clock" size={14} />
                0:00 / 0:00
              </div>
            </div>
            <div className="h-[120px] bg-secondary/30 rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-32 h-16 bg-primary/20 rounded border-2 border-primary"></div>
                <div className="w-32 h-16 bg-purple-500/20 rounded border border-border"></div>
                <div className="w-32 h-16 bg-blue-500/20 rounded border border-border"></div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border p-4">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="filters">Фильтры</TabsTrigger>
              <TabsTrigger value="transitions">Переходы</TabsTrigger>
              <TabsTrigger value="color">Цвет</TabsTrigger>
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

            <TabsContent value="transitions" className="space-y-2">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {transitions.map((transition) => (
                  <button
                    key={transition.id}
                    onClick={() => setSelectedTransition(transition.id as TransitionType)}
                    className={`w-full p-3 rounded-lg text-left transition-colors mb-2 flex items-center gap-3 ${
                      selectedTransition === transition.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <Icon name={transition.icon as any} size={18} />
                    <span className="text-sm font-medium">{transition.name}</span>
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
          <Button className="bg-primary hover:bg-primary/90">
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
