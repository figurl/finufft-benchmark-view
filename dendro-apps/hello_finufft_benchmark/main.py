from dendro.sdk import App
from FinufftBenchmarkProcessor import FinufftBenchmarkProcessor

app = App(
    app_name='hello_finufft_benchmark',
    description='Run a finufft benchmark for a particular git commit',
)

app.add_processor(FinufftBenchmarkProcessor)

if __name__ == '__main__':
    app.run()
