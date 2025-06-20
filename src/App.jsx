// app.jsx - 美化 UI 的音樂播放器 App + Capacitor Filesystem
import React, { useState, useRef } from 'react';
import {
  IonApp, IonReactRouter, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonList, IonItem, IonButtons, IonText
} from '@ionic/react';
import { playCircle, list, trash, add, save, folderOpen, play, pause, playSkipForward, playSkipBack } from 'ionicons/icons';
import { Redirect, Route } from 'react-router-dom';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Playlist Page
const Playlist = ({ songs, setSongs }) => {
  const fileInputRef = useRef(null);

  const handleAdd = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedSongs = [...songs];
    files.forEach(file => {
      if (file.type === 'audio/mpeg') {
        updatedSongs.push({ name: file.name, url: URL.createObjectURL(file) });
      }
    });
    setSongs(updatedSongs);
  };

  const handleSave = async () => {
    try {
      await Filesystem.writeFile({
        path: 'playlist.json',
        data: JSON.stringify(songs),
        directory: Directory.Documents
      });
      alert('已儲存播放清單到手機');
    } catch (err) {
      alert('儲存失敗');
    }
  };

  const handleLoad = async () => {
    try {
      const result = await Filesystem.readFile({
        path: 'playlist.json',
        directory: Directory.Documents
      });
      const loaded = JSON.parse(result.data);
      setSongs(loaded);
      alert('播放清單已載入');
    } catch (err) {
      alert('載入失敗或找不到 playlist.json');
    }
  };

  const handleRemove = (index) => {
    const updated = [...songs];
    updated.splice(index, 1);
    setSongs(updated);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>播放清單</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleAdd}><IonIcon icon={add} /></IonButton>
            <IonButton fill="clear" onClick={handleSave}><IonIcon icon={save} /></IonButton>
            <IonButton fill="clear" onClick={handleLoad}><IonIcon icon={folderOpen} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <input type="file" accept="audio/mpeg" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
        <IonList lines="inset">
          {songs.map((song, index) => (
            <IonItem key={index} className="ion-justify-content-between">
              <IonLabel>{song.name}</IonLabel>
              <IonButton color="danger" fill="clear" onClick={() => handleRemove(index)}>
                <IonIcon icon={trash} />
              </IonButton>
            </IonItem>
          ))}
          {songs.length === 0 && (
            <IonItem><IonText color="medium">尚未加入任何歌曲</IonText></IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

// Player Page
const Player = ({ songs }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!songs[currentIndex]) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(false);
  };

  const currentSong = songs[currentIndex] || { name: '尚無歌曲', url: '' };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>現在播放</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="player-display" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>{currentSong.name}</h2>
          <audio ref={audioRef} src={currentSong.url} onEnded={nextTrack} />
        </div>
        <div className="controls" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '40px' }}>
          <IonButton color="medium" shape="round" size="large" onClick={prevTrack}>
            <IonIcon icon={playSkipBack} />
          </IonButton>
          <IonButton color="primary" shape="round" size="large" onClick={togglePlay}>
            <IonIcon icon={isPlaying ? pause : play} />
          </IonButton>
          <IonButton color="medium" shape="round" size="large" onClick={nextTrack}>
            <IonIcon icon={playSkipForward} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

// Main App Component
const App = () => {
  const [songs, setSongs] = useState([]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/playlist">
              <Playlist songs={songs} setSongs={setSongs} />
            </Route>
            <Route exact path="/player">
              <Player songs={songs} />
            </Route>
            <Redirect exact from="/" to="/playlist" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom" color="dark">
            <IonTabButton tab="playlist" href="/playlist">
              <IonIcon icon={list} />
              <IonLabel>清單</IonLabel>
            </IonTabButton>
            <IonTabButton tab="player" href="/player">
              <IonIcon icon={playCircle} />
              <IonLabel>播放器</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
