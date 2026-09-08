/**
 * Utilitas Notifikasi & Audio Chime untuk ChronoCircle
 * Menggunakan Web Audio API (sintesis suara lokal tanpa dependensi file eksternal)
 * dan Web Notifications API untuk pengingat pergantian jadwal.
 */

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Memainkan bunyi nada lembut (melodic chime) penanda transisi waktu / jadwal baru.
   */
  playTransitionChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Not nada akord: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz)
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Envelop gain halus (fade in & fade out)
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch {
      // Audio autoplay policy mungkin membatasi sampai ada gesture user
    }
  }

  /**
   * Bunyi klik halus untuk feedback taktil tombol
   */
  playSoftTap() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundSynthesizer();

/**
 * Meminta izin notifikasi ke browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

/**
 * Mengirim notifikasi lokal di perangkat
 */
export function sendScheduleNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Jika di mobile PWA, coba via registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
          });
        });
      }
    }
  }
}
