# Mantis MCP Test Suite

This directory contains comprehensive tests for the Mantis MCP (Model Context Protocol) server.

## Test Structure

- `unit/` - Unit tests for individual tools and utilities
- `integration/` - Integration tests for MCP tool workflows
- `e2e/` - End-to-end tests simulating real user scenarios
- `mocks/` - Mock implementations and test data
- `fixtures/` - Test fixtures and sample data

## Test Categories

### 1. Environment Detection Tests
- Claude Desktop vs Claude Code detection
- Response format adaptation
- Tool availability validation

### 2. MCP Tool Tests
- Setup & Installation tools
- Development tools (code generation)
- Debugging tools (postMessage, errors)
- Testing tools (event simulation)
- Monitoring & Analytics tools

### 3. Mock Response Validation
- Response schema compliance
- Environment-specific adaptations
- Error handling scenarios

### 4. Integration Tests
- Complete workflow testing
- Cross-tool coordination
- Real-world scenario simulation

## Running Tests

```bash
npm test                    # Run all tests
npm test -- unit          # Run only unit tests
npm test -- integration   # Run only integration tests
npm test -- e2e           # Run only e2e tests
```

## Test Data

All test scenarios use realistic but mock data to demonstrate the MCP's capabilities without requiring actual Mantis SDK integration.