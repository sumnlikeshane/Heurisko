// Host-selected semantic versions; assertion material selects neither profile nor code.
export const CURRENT_TRUST_PROFILE='npm-gha-slsa-v1-draft.2' as const;
export const LEGACY_TRUST_PROFILE='npm-gha-slsa-v1-draft.1' as const;
export type TrustProfile=typeof CURRENT_TRUST_PROFILE|typeof LEGACY_TRUST_PROFILE;
export function isTrustProfile(value:unknown):value is TrustProfile {
 return value===CURRENT_TRUST_PROFILE||value===LEGACY_TRUST_PROFILE;
}
export function trustProfileLogVersions(profile:TrustProfile):readonly string[] {
 return profile===LEGACY_TRUST_PROFILE?['0.0.1','0.0.2']:['0.0.1'];
}
