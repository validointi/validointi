import { Validator } from "../public-api";
import { ValidationId } from "../public-api";
import {  Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
  })
export class ValidatorRegisteryService {
    #registery = new Map<ValidationId,Validator>()

    registerValidator = (name:ValidationId,fn:Validator) => {
        this.#registery.set(name,fn);
        return this.getValidationFn(name)
    }
    
    getValidationFn = (name:ValidationId) => (data:Model) => {
        const fn = this.#registery.get(name)
        if (!fn) {
            throw new Error(`No validator found with name "${name}"`);        
        }
        return (data:Model) => fn(data,name); 
    }

    getValidator = (name:ValidationId) => {
        const fn = this.#registery.get(name)
        if (!fn) {
            throw new Error(`No validator found with name "${name}"`);        
        }
        return fn;  
    }
}