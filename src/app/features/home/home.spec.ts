import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      // A Home tem um routerLink ("Ver produtos"), que precisa do roteador.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tem o botao que leva ao catalogo', () => {
    const botao = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a[href="/produtos"]');
    expect(botao?.textContent).toContain('Ver produtos');
  });
});
