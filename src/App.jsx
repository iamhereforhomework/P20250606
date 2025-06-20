import React, { useState, useRef, useEffect } from "react";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonButtons,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  useIonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import {
  add,
  save,
  folderOpen,
  musicalNote,
  play,
  pause,
  playSkipBack,
  playSkipForward,
  trash,
  list,
  playCircle,
  musicalNotesOutline,
} from "ionicons/icons";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";
import "./App.css";

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const playlistInputRef = useRef(null);

  const [present] = useIonToast();

  // File Selection and Playlist Creation
  const addMusic = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newPlaylistItems = files
      .filter((file) => file.type === "audio/mpeg" || file.name.endsWith(".mp3"))
      .map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name.replace(/\.mp3$/i, ""),
        url: URL.createObjectURL(file),
        file: file,
      }));
    setPlaylist((prev) => [...prev, ...newPlaylistItems]);
    event.target.value = "";
  };

  // Playlist Display and Modification
  const removeMusic = (indexToRemove, e) => {
    e.stopPropagation();
    if (indexToRemove === currentIndex) {
      stopMusic();
    }
    setPlaylist((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (indexToRemove < currentIndex) {
      setCurrentIndex((idx) => idx - 1);
    } else if (indexToRemove === currentIndex) {
      setCurrentIndex(-1);
    }
  };

  // Playback Operations
  const playMusic = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (currentIndex === -1) return;
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((idx) => (idx + 1) % playlist.length);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((idx) => (idx === 0 ? playlist.length - 1 : idx - 1));
    setIsPlaying(true);
  };

  // Audio Element Management
  useEffect(() => {
    if (currentIndex === -1 || !playlist[currentIndex]) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = playlist[currentIndex].url;
    } else {
      audioRef.current = new Audio(playlist[currentIndex].url);
    }
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) {
      audioRef.current.play();
    }
    const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
    const handleLoadedMetadata = () => setDuration(audioRef.current.duration);
    const handleEnded = () => nextTrack();
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
    // eslint-disable-next-line
  }, [currentIndex, playlist]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Playlist Persistence
  const savePlaylist = () => {
    if (playlist.length === 0) {
      present({ message: "Playlist is empty, cannot save.", duration: 2000, position: "bottom" });
      return;
    }
    const playlistData = playlist.map((item) => ({
      id: item.id,
      name: item.name,
      fileName: item.file.name,
    }));
    const dataStr = JSON.stringify(playlistData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = "playlist.json";
    link.click();
    URL.revokeObjectURL(link.href);
    present({ message: "Playlist saved.", duration: 2000, position: "bottom" });
  };

  const loadPlaylist = () => {
    playlistInputRef.current?.click();
  };

  const handlePlaylistLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const loaded = JSON.parse(e.target.result);
        present({ message: "Playlist loaded. Please select the corresponding music files again.", duration: 2000, position: "bottom" });
        // Optionally, you can prompt the user to re-select the files and match by fileName
      } catch (error) {
        present({ message: "Invalid playlist file format.", duration: 2000, position: "bottom" });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Utility
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const seekTo = (event) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.nativeEvent.clientX - rect.left) / rect.width;
    const newTime = percentage * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Pages
  const currentTrack = playlist[currentIndex];

  const PlaylistPage = () => (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Playlist</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={addMusic}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
            <IonButton onClick={savePlaylist}>
              <IonIcon slot="icon-only" icon={save} />
            </IonButton>
            <IonButton onClick={loadPlaylist}>
              <IonIcon slot="icon-only" icon={folderOpen} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {playlist.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={musicalNotesOutline} />
            <h3>Playlist is empty</h3>
            <p>Click the + button to add music</p>
          </div>
        ) : (
          <IonList>
            {playlist.map((item, index) => (
              <IonItem
                key={item.id}
                onClick={() => playMusic(index)}
                button
                lines="full"
                className={index === currentIndex ? "playing" : ""}
              >
                <IonIcon icon={musicalNote} slot="start" />
                <IonLabel>
                  <h2>{item.name}</h2>
                  <p>MP3 Audio File</p>
                </IonLabel>
                <IonButton
                  fill="clear"
                  color="medium"
                  slot="end"
                  onClick={(e) => removeMusic(index, e)}
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );

  const PlayerPage = () => (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/playlist">
              <IonIcon slot="icon-only" icon={list} />
            </IonButton>
          </IonButtons>
          <IonTitle>Now Playing</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="now-playing-card">
          {!currentTrack ? (
            <div className="empty-state">
              <IonIcon icon={musicalNotesOutline} />
              <h3>No music playing</h3>
              <p>Select a song from the playlist</p>
            </div>
          ) : (
            <>
              <div className="album-art">
                <IonIcon icon={musicalNote} />
              </div>
              <h2>{currentTrack.name}</h2>
              <p>MP3 Audio File</p>
              <div className="progress-container">
                <div className="progress-bar" onClick={seekTo}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(currentTime / duration) * 100 || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="time-info">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="control-buttons">
                <IonButton
                  className="control-btn"
                  fill="clear"
                  onClick={previousTrack}
                >
                  <IonIcon slot="icon-only" icon={playSkipBack} />
                </IonButton>
                <IonButton
                  className="control-btn play-btn"
                  onClick={togglePlayPause}
                  fill="clear"
                >
                  <IonIcon slot="icon-only" icon={isPlaying ? pause : play} />
                </IonButton>
                <IonButton
                  className="control-btn"
                  fill="clear"
                  onClick={nextTrack}
                >
                  <IonIcon slot="icon-only" icon={playSkipForward} />
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/playlist" component={PlaylistPage} exact={true} />
            <Route path="/player" component={PlayerPage} exact={true} />
            <Redirect exact from="/" to="/playlist" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="playlist" href="/playlist">
              <IonIcon icon={list} />
              <IonLabel>Playlist</IonLabel>
            </IonTabButton>
            <IonTabButton tab="player" href="/player">
              <IonIcon icon={playCircle} />
              <IonLabel>Player</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".mp3"
        multiple
        onChange={handleFileSelect}
      />
      <input
        type="file"
        ref={playlistInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handlePlaylistLoad}
      />
    </IonApp>
  );
};

export default App;