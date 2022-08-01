/*
 * Public API Surface of validator
 */

export * from './lib/validator.service';
export * from './lib/validator.component';
export * from './lib/validator.module';


export interface Model {
    [key:string]: any;
}

export interface ValidationErrors {
    [key: keyof Model]: undefined | string | string[]
}

export type ValidationId = string

export interface Validator {
    (data:Model,id:ValidationId) : ValidationErrors
}