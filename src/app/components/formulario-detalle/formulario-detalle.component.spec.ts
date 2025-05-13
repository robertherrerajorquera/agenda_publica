import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioDetalleComponent } from './formulario-detalle.component';

describe('FormularioDetalleComponent', () => {
  let component: FormularioDetalleComponent;
  let fixture: ComponentFixture<FormularioDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
