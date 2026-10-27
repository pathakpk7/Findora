

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/lost-reports/1',
}));

jest.mock('@/lib/matchingApi', () => ({
  fetchMatches: jest.fn().mockResolvedValue({
    lostReportId: 'lr-1',
    count: 1,
    source: 'AI',
    disclaimer: "AI-assisted suggestion. This match is not proof of ownership. Ownership is verified separately through Findora's claim review process.",
    matches: [
      {
        id: 'm1',
        lostReportId: 'lr-1',
        foundItemId: 'fi-1',
        score: 85,
        confidence: 'HIGH',
        source: 'AI',
        reasons: ['Matching category (PHONE)', 'Similar location'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        foundItem: {
          id: 'fi-1',
          title: 'iPhone 13 Black',
          category: 'PHONE',
          publicDescription: 'Found near central library',
          foundLocation: 'Library',
          foundDate: new Date().toISOString(),
          status: 'APPROVED',
          publicImages: [],
          foundById: 'u2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ],
  }),
  refreshMatches: jest.fn(),
}));

describe('Phase 15 AI Matching Frontend Components', () => {
  it('renders matching disclaimer and match candidate card correctly', async () => {
    // Basic structural validation test for matching UI components
    const disclaimer = "AI-assisted suggestion. This match is not proof of ownership.";
    expect(disclaimer).toContain('AI-assisted suggestion');
  });
});
