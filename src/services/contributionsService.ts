// DEPRECATED: contributions service removed (funding disabled)
// This compatibility shim preserves a minimal API so callers don't break.

export const contributionsService = {
  createContribution: async (..._args: any[]) => ({ success: false, error: 'Contributions are disabled in this build' }),
  getProjectContributions: async (_projectId: string) => ({ success: true, contributions: [], totalAmount: 0, totalContributors: 0 }),
  getUserContributions: async (_userId: string) => ({ success: true, contributions: [] }),
  processContribution: async (..._args: any[]) => ({ success: false, error: 'Contributions are disabled' }),
  updateContributionStatus: async (_txHash: string, _status: string, _blockNumber?: number, _gasUsed?: number) => ({ success: true }),
  updateProjectTotals: async (_projectId: string) => ({ success: true }),
  hasUserContributed: async (_projectId: string, _userId: string) => false,
  getContributionByTxHash: async (_txHash: string) => ({
    success: true,
    contribution: {
      id: 'disabled',
      project_id: null,
      amount: 0,
      currency: 'USD',
      status: 'disabled',
      contributor_id: null,
      blockchain_tx_hash: _txHash
    }
  })
};

export default contributionsService;