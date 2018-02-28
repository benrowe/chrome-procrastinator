/**
 * Enum to represent all the diffent types of control mechanisms
 */

module TimecodeControl {
  export enum Types {
    site = 'site',
    global = 'global',
    disabled = 'disabled',
  }
  export function fromString(ty: string): Types
  {
    return Types[ty as keyof typeof Types];
  }
}

export default TimecodeControl;
