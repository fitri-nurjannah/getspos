
export class BaseHelpers {
  constructor() { }

  static getPlanName(): any {
    return {
      freemium: 'freemium',
      location: 'location',
      enterprise: 'enterprise',
    };
  }

  static getVerificationCodeType(): any {
    return {
      signup: 'signup',
      forgotPassword: 'forgotPassword',
    };
  }


  // used to check a planName is matching with the base plan names
  static checkPlanName(_planString): any {
    return {
      isFreemium: this.getPlanName().freemium.toUpperCase() == (_planString ? _planString.toUpperCase() : _planString), // checking freemium
      isLocation: this.getPlanName().location.toUpperCase() == (_planString ? _planString.toUpperCase() : _planString), // checking location
      isEnterprise: this.getPlanName().enterprise.toUpperCase() == (_planString ? _planString.toUpperCase() : _planString), // checking enterprise
    };
  }
}
