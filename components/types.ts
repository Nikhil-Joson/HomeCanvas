/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Product {
  id: number;
  name: string;
  imageUrl: string;
}

export interface StagedProduct {
  file: File;
  imageUrl: string;
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  scale: number;
  width: number;
}