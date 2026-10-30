export function canSignContract(permission: { authorized: boolean } | null | undefined, failed = false) {
  return !failed && permission?.authorized === true;
}