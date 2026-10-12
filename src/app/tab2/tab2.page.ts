import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly sortOrder = signal<'newest' | 'oldest'>('newest');
  readonly searchQuery = signal<string>('');
  readonly valueFilter = signal<'all' | 'positive' | 'negative'>('all'); // 1. Nový signál pro filtr hodnot

  readonly filteredAndSortedCounters = computed(() => {
    const counters = [...this.counterService.counters()];
    const query = this.searchQuery().toLowerCase().trim();
    const order = this.sortOrder();
    const valFilter = this.valueFilter();

    // 1. Filtrování podle textu (názvu)
    let filtered = query
      ? counters.filter((counter) => counter.name.toLowerCase().includes(query))
      : counters;

    // 2. Filtrování podle hodnoty (kladné / záporné)
    if (valFilter === 'positive') {
      filtered = filtered.filter((counter) => counter.value > 0);
    } else if (valFilter === 'negative') {
      filtered = filtered.filter((counter) => counter.value < 0);
    }

    // 3. Řazení výsledků
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  });

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'dark',
    });
    await toast.present();
  }

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    await this.showToast('Počítadlo úspěšně smazáno');
  }

  async clear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Potvrzení smazání',
      message: 'Opravdu chcete smazat celou historii počítadel?!',
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
        },
        {
          text: 'Smazat vše',
          role: 'destructive',
          handler: async () => {
            await this.counterService.clear();
            await this.showToast('Celá historie byla vymazána.');
          },
        },
      ],
    });
    await alert.present();
  }
}