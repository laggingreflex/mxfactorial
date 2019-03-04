resource "aws_sqs_queue" "transact_to_rules" {
  name                       = "transact-to-rules-queue-${var.environment}"
  max_message_size           = 262144
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 3

  // visibility_timeout_seconds equal to default lambda timeout to avoid
  // "less than Function timeout" terraform error
}

resource "aws_sqs_queue" "rules_to_transact" {
  name                       = "rules-to-transact-queue-${var.environment}"
  max_message_size           = 262144
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 3

  // visibility_timeout_seconds equal to default lambda timeout to avoid
  // "less than Function timeout" terraform error
}

########### trigger rules lambda with sqs event ###########
resource "aws_lambda_event_source_mapping" "transact_to_rules" {
  event_source_arn = "${aws_sqs_queue.transact_to_rules.arn}"
  function_name    = "${aws_lambda_function.rules_service_lambda.arn}"
}

resource "aws_lambda_permission" "transact_to_rules_service_lambda" {
  statement_id  = "AllowVpceSQSToInvokeRulesLambda${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.rules_service_lambda.arn}"
  principal     = "sqs.amazonaws.com"
  source_arn    = "${aws_sqs_queue.transact_to_rules.arn}"
}

# data "archive_file" "rules_service_lambda_provisioner" {
#   type        = "zip"
#   source_dir  = "../../../services/rules-faas"
#   output_path = "../../../services/rules-faas/rules-lambda.zip"
#   depends_on = ["null_resource.rules_service_lambda_provisioner"]
# }

####### create vpc endpoint for sqs service access by lambda in vpc #######
resource "aws_vpc_endpoint" "sqs" {
  vpc_id = "${data.aws_vpc.default.id}"

  # aws ec2 describe-vpc-endpoint-services
  service_name      = "com.amazonaws.${data.aws_region.current.name}.sqs"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    "${aws_security_group.rds.id}",
  ]

  subnet_ids          = ["${data.aws_subnet_ids.default.ids}"]
  private_dns_enabled = true
}