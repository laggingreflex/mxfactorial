resource "aws_lambda_function" "rules_service_lambda" {
  filename = "../../../services/rules-faas/rules-lambda.zip"

  # filename      = "${data.archive_file.rules_service_lambda_provisioner.output_path}"
  function_name = "rules-lambda-${var.environment}"
  description   = "rules service in ${var.environment}"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  source_code_hash = "${base64sha256(file("../../../services/rules-faas/rules-lambda.zip"))}"

  # source_code_hash = "${data.archive_file.rules_service_lambda_provisioner.output_base64sha256}"
  runtime = "nodejs8.10"
  role    = "${aws_iam_role.rules_service_lambda_role.arn}"

  vpc_config {
    subnet_ids = ["${data.aws_subnet_ids.default.ids}"]

    security_group_ids = [
      "${aws_security_group.rds.id}",
      "${data.aws_security_group.default.id}",
    ]

    # "${aws_security_group.vpce_sqs.id}",
  }

  environment {
    variables = {
      HOST                    = "${aws_rds_cluster.default.endpoint}"
      USER                    = "${var.db_master_username}"
      PASSWORD                = "${var.db_master_password}"
      RULES_TO_TRANSACT_QUEUE = "${aws_sqs_queue.rules_to_transact.id}"
    }
  }
}

resource "aws_iam_role" "rules_service_lambda_role" {
  name = "rules-service-lambda-role-${var.environment}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# Policy for Lambda to create logs and access rds
resource "aws_iam_role_policy" "rules_service_lambda_policy" {
  name = "rules-service-lambda-policy-${var.environment}"
  role = "${aws_iam_role.rules_service_lambda_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

# policy for lambda to sns policy
resource "aws_iam_role_policy" "rules_service_lambda_messaging_policy" {
  name = "rules-service-lambda-messaging-policy-${var.environment}"
  role = "${aws_iam_role.rules_service_lambda_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sqs:*",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_rules_lambda" {
  role       = "${aws_iam_role.rules_service_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

# resource "null_resource" "rules_service_lambda_provisioner" {
#   provisioner "local-exec" {
#     working_dir = "../../../services/rules-faas"
#     command     = "yarn install"
#   }
# }
