export class FileStorageHelpers {
  constructor() {}

  static checkIfFile(_i): boolean {
    return !!Object.prototype.hasOwnProperty.call(_i, 'originalName');
  }
}
