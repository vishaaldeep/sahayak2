from openfeature import api
from openfeature.provider import AbstractProvider
from openfeature.evaluation_context import EvaluationContext
from openfeature.flag_evaluation import FlagResolutionDetails, Reason, ErrorCode

class MyProvider(AbstractProvider):
    def __init__(self):
        self.name = "MyProvider"

    @property
    def metadata(self):
        return {"name": self.name}

    def resolve_boolean_details(self, flag_key: str, default_value: bool, evaluation_context: EvaluationContext) -> FlagResolutionDetails:
        if flag_key == "my-boolean-flag":
            return FlagResolutionDetails(value=True, reason=Reason.STATIC)
        return FlagResolutionDetails(value=default_value, reason=Reason.ERROR, error_code=ErrorCode.FLAG_NOT_FOUND)

    def resolve_string_details(self, flag_key: str, default_value: str, evaluation_context: EvaluationContext) -> FlagResolutionDetails:
        if flag_key == "my-string-flag":
            return FlagResolutionDetails(value="hello", reason=Reason.STATIC)
        return FlagResolutionDetails(value=default_value, reason=Reason.ERROR, error_code=ErrorCode.FLAG_NOT_FOUND)

    def resolve_float_details(self, flag_key: str, default_value: float, evaluation_context: EvaluationContext) -> FlagResolutionDetails:
        if flag_key == "my-float-flag":
            return FlagResolutionDetails(value=1.23, reason=Reason.STATIC)
        return FlagResolutionDetails(value=default_value, reason=Reason.ERROR, error_code=ErrorCode.FLAG_NOT_FOUND)

    def resolve_integer_details(self, flag_key: str, default_value: int, evaluation_context: EvaluationContext) -> FlagResolutionDetails:
        if flag_key == "my-int-flag":
            return FlagResolutionDetails(value=123, reason=Reason.STATIC)
        return FlagResolutionDetails(value=default_value, reason=Reason.ERROR, error_code=ErrorCode.FLAG_NOT_FOUND)

    def resolve_object_details(self, flag_key: str, default_value: dict, evaluation_context: EvaluationContext) -> FlagResolutionDetails:
        if flag_key == "my-object-flag":
            return FlagResolutionDetails(value={"key": "value"}, reason=Reason.STATIC)
        return FlagResolutionDetails(value=default_value, reason=Reason.ERROR, error_code=ErrorCode.FLAG_NOT_FOUND)


# Set the provider
api.set_provider(MyProvider())

# Get a client
client = api.get_client()

# Evaluate flags
boolean_flag = client.get_boolean_value("my-boolean-flag", False)
string_flag = client.get_string_value("my-string-flag", "default")
float_flag = client.get_float_value("my-float-flag", 0.0)
int_flag = client.get_int_value("my-int-flag", 0)
object_flag = client.get_object_value("my-object-flag", {})

print(f"Boolean Flag: {boolean_flag}")
print(f"String Flag: {string_flag}")
print(f"Float Flag: {float_flag}")
print(f"Int Flag: {int_flag}")
print(f"Object Flag: {object_flag}")
