-include .env

.PHONY: all clean install build test format lint frontend dashboard anvil contracts slither coverage

all: clean install build

# Clean the repo
clean:
	forge clean
	rm -rf out
	rm -rf frontend/.next
	rm -rf aurient_data/__pycache__

# Install dependencies for all components
install:
	cd frontend && yarn install
	cd ../contracts && forge install
	cd ../aurient_data && pip install -r requirements.txt

# Build contracts
build:
	cd contracts && forge build

# Run all tests
# (Solidity)
test:
	cd contracts && forge test

# Format Solidity code
format:
	cd contracts && forge fmt

# Lint Solidity code (requires solhint)
lint:
	cd contracts && npx solhint src/**/*.sol

# Run the Next.js frontend
frontend:
	cd frontend && yarn dev

# Run the Streamlit data dashboard
dashboard:
	cd aurient_data && streamlit run oura_streamlit_app.py

# Start local anvil node
anvil:
	anvil -m 'test test test test test test test test test test test test junk'

# Security analysis (requires slither)
slither:
	cd contracts && slither ./src

# Generate forge coverage (requires lcov and genhtml)
coverage:
	cd contracts && mkdir -p coverage && forge coverage --report lcov --no-match-path "test/*"
	cd contracts && lcov --remove lcov.info -o coverage/lcov.info 'test/*' 'script/*' --rc lcov_branch_coverage=1
	cd contracts && genhtml coverage/lcov.info -o coverage --rc lcov_branch_coverage=1

# Generate ABI for HealthDataMarketplace contract
abi:
	cd contracts && jq '.abi' out/HealthDataMarketplace.sol/HealthDataMarketplace.json > abi/HealthDataMarketplace.json 