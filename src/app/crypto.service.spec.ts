import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should decrypt / encrypt', () => {
    const key = '---enter-key-here---';
    const text = '';
    const value = service.encrypt(text, key);
    const decrypted = service.decrypt(value, key);
    expect(decrypted).toBe(text);
  });
});
